"""LLM service for OpenAI and Claude"""
import json
import asyncio
from typing import Optional, Dict, Any, List, AsyncIterator
from openai import OpenAI, AsyncOpenAI
from anthropic import Anthropic, AsyncAnthropic
from app.services.base_service import BaseService
from app.core.config import settings
from app.models.llm_usage import LLMUsage
from app.services.parsers.profile_parser import ProfileParser


class LLMService(BaseService):
    """Service for interacting with LLM providers"""
    
    # Model-specific max_tokens limits (completion tokens)
    MODEL_LIMITS = {
        # GPT-5 models (latest)
        "gpt-5.2": 16384,  # 16k completion tokens
        "gpt-5.1": 16384,  # 16k completion tokens
        # GPT-4o models
        "gpt-4o": 16384,  # 16k completion tokens
        "gpt-4o-mini": 16384,  # 16k completion tokens
        # Claude models
        "claude-3-opus": 4096,
        "claude-3-sonnet": 4096,
        "claude-3-haiku": 4096,
    }
    
    # Pricing per 1M tokens (USD) - Updated January 2026
    # Source: https://platform.openai.com/docs/pricing
    OPENAI_INPUT_COST_PER_M = {
        # GPT-5 models
        "gpt-5.2": 1.75,
        "gpt-5.1": 1.25,
        # GPT-4o models
        "gpt-4o": 5.00,
        "gpt-4o-mini": 0.15,
    }
    OPENAI_OUTPUT_COST_PER_M = {
        # GPT-5 models
        "gpt-5.2": 14.00,
        "gpt-5.1": 10.00,
        # GPT-4o models
        "gpt-4o": 15.00,
        "gpt-4o-mini": 0.60,
    }

    def __init__(self, db, redis_client=None):
        super().__init__(db, redis_client)
        self.openai_client = None
        self.async_openai_client = None
        self.anthropic_client = None
        self.async_anthropic_client = None
        
        # Only initialize clients if API keys are provided
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_openai_api_key_here":
            try:
                self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
                self.async_openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception as e:
                self._log(f"Failed to initialize OpenAI client: {e}", "WARNING")
        
        if settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY != "your_anthropic_api_key_here":
            try:
                self.anthropic_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
                self.async_anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            except Exception as e:
                self._log(f"Failed to initialize Anthropic client: {e}", "WARNING")
    
    def _validate_max_tokens(self, model: str, max_tokens: int) -> int:
        """Validate and cap max_tokens based on model limits"""
        limit = self.MODEL_LIMITS.get(model, 4096)  # Default to 4096 if model not found
        if max_tokens > limit:
            self._log(
                f"max_tokens {max_tokens} exceeds model {model} limit ({limit}). Capping to {limit}.",
                "WARNING"
            )
            return limit
        return max_tokens
    
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4000,
        response_format: Optional[Dict[str, Any]] = None,
        run_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate text using LLM
        
        Args:
            prompt: User prompt
            system_prompt: System prompt
            provider: 'openai' or 'anthropic' (uses default if None)
            model: Model name (uses default if None)
            temperature: Temperature for generation
            max_tokens: Maximum tokens to generate
            response_format: Format specification (e.g., {"type": "json_object"})
        
        Returns:
            Dict with 'content', 'model', 'provider', 'usage'
        """
        provider = provider or settings.DEFAULT_LLM_PROVIDER
        model = model or settings.DEFAULT_MODEL
        
        if provider == "openai":
            return self._generate_openai(
                prompt, system_prompt, model, temperature, max_tokens, response_format, run_id
            )
        elif provider == "anthropic":
            return self._generate_anthropic(
                prompt, system_prompt, model, temperature, max_tokens, run_id
            )
        else:
            raise ValueError(f"Unknown provider: {provider}")
    
    def _generate_openai(
        self,
        prompt: str,
        system_prompt: Optional[str],
        model: str,
        temperature: float,
        max_tokens: int,
        response_format: Optional[Dict[str, Any]],
        run_id: Optional[str],
    ) -> Dict[str, Any]:
        """Generate using OpenAI"""
        if not self.openai_client:
            raise ValueError(
                "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file."
            )
        
        # Validate and cap max_tokens
        max_tokens = self._validate_max_tokens(model, max_tokens)
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        kwargs = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        
        if response_format:
            kwargs["response_format"] = response_format
        
        response = self.openai_client.chat.completions.create(**kwargs)
        usage = {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
        }
        cost_usd = self._calculate_cost(model, usage["prompt_tokens"], usage["completion_tokens"])
        self._log_usage(run_id, model, usage, cost_usd)
        
        return {
            "content": response.choices[0].message.content,
            "model": model,
            "provider": "openai",
            "usage": usage,
            "cost_usd": cost_usd,
        }
    
    def _generate_anthropic(
        self,
        prompt: str,
        system_prompt: Optional[str],
        model: str,
        temperature: float,
        max_tokens: int,
        run_id: Optional[str],
    ) -> Dict[str, Any]:
        """Generate using Anthropic Claude"""
        if not self.anthropic_client:
            raise ValueError(
                "Anthropic API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            )
        
        # Validate and cap max_tokens
        max_tokens = self._validate_max_tokens(model, max_tokens)
        
        kwargs = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        
        if system_prompt:
            kwargs["system"] = system_prompt
        
        kwargs["messages"] = [{"role": "user", "content": prompt}]
        
        response = self.anthropic_client.messages.create(**kwargs)
        usage = {
            "prompt_tokens": response.usage.input_tokens,
            "completion_tokens": response.usage.output_tokens,
            "total_tokens": response.usage.input_tokens + response.usage.output_tokens,
        }
        # Placeholder anthropic pricing (set to zero for now)
        cost_usd = self._calculate_cost(model, usage["prompt_tokens"], usage["completion_tokens"])
        self._log_usage(run_id, model, usage, cost_usd)
        
        return {
            "content": response.content[0].text,
            "model": model,
            "provider": "anthropic",
            "usage": usage,
            "cost_usd": cost_usd,
        }
    
    def generate_structured(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Dict[str, Any]] = None,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4000,
        run_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate structured output (JSON)
        
        Args:
            prompt: User prompt
            system_prompt: System prompt
            schema: JSON schema for structured output
            provider: LLM provider
            model: Model name
            temperature: Temperature for generation (default: 0.7)
            max_tokens: Maximum tokens to generate (default: 4000)
        
        Returns:
            Parsed JSON response
        """
        response_format = None
        
        if provider == "openai" or (provider is None and settings.DEFAULT_LLM_PROVIDER == "openai"):
            # OpenAI supports JSON mode
            response_format = {"type": "json_object"}
            if schema:
                # Add schema instruction to prompt
                prompt = f"{prompt}\n\nReturn a JSON object matching this schema: {json.dumps(schema, indent=2)}"
        elif schema:
            # For other providers, include schema in prompt
            prompt = f"{prompt}\n\nReturn a JSON object matching this schema: {json.dumps(schema, indent=2)}"
        
        response = self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            provider=provider,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format=response_format,
            run_id=run_id,
        )
        
        try:
            return json.loads(response["content"])
        except json.JSONDecodeError:
            self._log(f"Failed to parse JSON from LLM response: {response['content']}", "ERROR")
            raise ValueError("LLM response is not valid JSON")
    
    # ----------------------------------------------------------------------
    # ASYNC GENERATION
    # ----------------------------------------------------------------------
    async def generate_async(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4000,
        response_format: Optional[Dict[str, Any]] = None,
        run_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        provider = provider or settings.DEFAULT_LLM_PROVIDER
        model = model or settings.DEFAULT_MODEL

        if provider == "openai":
            return await self._generate_openai_async(
                prompt, system_prompt, model, temperature, max_tokens, response_format, run_id
            )
        elif provider == "anthropic":
            return await self._generate_anthropic_async(
                prompt, system_prompt, model, temperature, max_tokens, run_id
            )
        else:
            raise ValueError(f"Unknown provider: {provider}")

    # ----------------------------------------------------------------------
    # STREAMING METHODS
    # ----------------------------------------------------------------------
    async def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4000,
        run_id: Optional[str] = None,  # Streaming usage not captured
    ) -> AsyncIterator[str]:
        """
        Generate text using LLM with streaming
        
        Args:
            prompt: User prompt
            system_prompt: System prompt
            provider: 'openai' or 'anthropic' (uses default if None)
            model: Model name (uses default if None)
            temperature: Temperature for generation
            max_tokens: Maximum tokens to generate
        
        Yields:
            Text chunks as they are generated
        """
        provider = provider or settings.DEFAULT_LLM_PROVIDER
        model = model or settings.DEFAULT_MODEL
        
        if provider == "openai":
            async for chunk in self._generate_openai_stream(
                prompt, system_prompt, model, temperature, max_tokens
            ):
                yield chunk
        elif provider == "anthropic":
            async for chunk in self._generate_anthropic_stream(
                prompt, system_prompt, model, temperature, max_tokens
            ):
                yield chunk
        else:
            raise ValueError(f"Unknown provider: {provider}")
    
    async def _generate_openai_stream(
        self,
        prompt: str,
        system_prompt: Optional[str],
        model: str,
        temperature: float,
        max_tokens: int,
    ) -> AsyncIterator[str]:
        """Generate using OpenAI with streaming"""
        if not self.async_openai_client:
            raise ValueError(
                "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file."
            )
        
        # Validate and cap max_tokens
        max_tokens = self._validate_max_tokens(model, max_tokens)
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        stream = await self.async_openai_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    async def _generate_anthropic_stream(
        self,
        prompt: str,
        system_prompt: Optional[str],
        model: str,
        temperature: float,
        max_tokens: int,
    ) -> AsyncIterator[str]:
        """Generate using Anthropic with streaming"""
        if not self.async_anthropic_client:
            raise ValueError(
                "Anthropic API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            )
        
        # Validate and cap max_tokens
        max_tokens = self._validate_max_tokens(model, max_tokens)
        
        messages = [{"role": "user", "content": prompt}]
        
        kwargs = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": messages,
        }
        
        if system_prompt:
            kwargs["system"] = system_prompt
        
        async with self.async_anthropic_client.messages.stream(**kwargs) as stream:
            async for text in stream.text_stream:
                yield text

    # ----------------------------------------------------------------------
    # INTERNAL HELPERS
    # ----------------------------------------------------------------------
    async def _generate_openai_async(
        self,
        prompt: str,
        system_prompt: Optional[str],
        model: str,
        temperature: float,
        max_tokens: int,
        response_format: Optional[Dict[str, Any]],
        run_id: Optional[str],
    ) -> Dict[str, Any]:
        if not self.async_openai_client:
            raise ValueError(
                "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file."
            )

        max_tokens = self._validate_max_tokens(model, max_tokens)

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        kwargs = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if response_format:
            kwargs["response_format"] = response_format

        response = await self.async_openai_client.chat.completions.create(**kwargs)
        usage = {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
        }
        cost_usd = self._calculate_cost(model, usage["prompt_tokens"], usage["completion_tokens"])
        self._log_usage(run_id, model, usage, cost_usd)

        return {
            "content": response.choices[0].message.content,
            "model": model,
            "provider": "openai",
            "usage": usage,
            "cost_usd": cost_usd,
        }

    async def _generate_anthropic_async(
        self,
        prompt: str,
        system_prompt: Optional[str],
        model: str,
        temperature: float,
        max_tokens: int,
        run_id: Optional[str],
    ) -> Dict[str, Any]:
        if not self.async_anthropic_client:
            raise ValueError(
                "Anthropic API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            )

        max_tokens = self._validate_max_tokens(model, max_tokens)

        kwargs = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_prompt:
            kwargs["system"] = system_prompt

        response = await self.async_anthropic_client.messages.create(**kwargs)
        usage = {
            "prompt_tokens": response.usage.input_tokens,
            "completion_tokens": response.usage.output_tokens,
            "total_tokens": response.usage.input_tokens + response.usage.output_tokens,
        }
        cost_usd = self._calculate_cost(model, usage["prompt_tokens"], usage["completion_tokens"])
        self._log_usage(run_id, model, usage, cost_usd)

        return {
            "content": response.content[0].text,
            "model": model,
            "provider": "anthropic",
            "usage": usage,
            "cost_usd": cost_usd,
        }

    def generate_profile_analysis(self, prompt: str) -> str:
        """
        Generate profile analysis and extract clean JSON.
        
        Args:
            prompt: User prompt for profile analysis
            
        Returns:
            Clean JSON string extracted from delimiters
        """
        raw = self.generate(prompt)
        clean = ProfileParser.extract_json_string(raw["content"])
        return clean

    def _calculate_cost(self, model: str, prompt_tokens: int, completion_tokens: int) -> float:
        """Approximate cost in USD based on hardcoded pricing."""
        input_rate = self.OPENAI_INPUT_COST_PER_M.get(model, 0)
        output_rate = self.OPENAI_OUTPUT_COST_PER_M.get(model, 0)

        cost_input = (prompt_tokens / 1_000_000) * input_rate
        cost_output = (completion_tokens / 1_000_000) * output_rate
        return round(cost_input + cost_output, 6)

    def _log_usage(
        self,
        run_id: Optional[str],
        model: str,
        usage: Dict[str, int],
        cost_usd: float,
    ) -> None:
        """Persist token usage if run_id is provided."""
        if not run_id:
            return
        try:
            record = LLMUsage(
                run_id=run_id,
                model=model,
                prompt_tokens=usage.get("prompt_tokens", 0) or 0,
                completion_tokens=usage.get("completion_tokens", 0) or 0,
                total_tokens=usage.get("total_tokens", 0) or 0,
                cost_usd=cost_usd or 0,
            )
            self.db.add(record)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            self._log(f"Failed to log LLM usage: {e}", "WARNING")

