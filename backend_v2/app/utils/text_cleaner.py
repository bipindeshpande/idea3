import re


def extract_profile_json(text: str) -> str:
    """
    Extracts the JSON block between the profile delimiters.
    Cleans markdown, bullets, whitespace, and ensures single-line JSON.
    """

    START = "---PROFILE_ANALYSIS_START---"
    END = "---PROFILE_ANALYSIS_END---"

    if START not in text or END not in text:
        return ""

    raw = text.split(START)[1].split(END)[0].strip()

    raw = raw.replace("\n", " ").replace("\t", " ")
    raw = re.sub(r"\s+", " ", raw)

    match = re.search(r"\{.*\}", raw)
    if not match:
        return ""

    clean_json = match.group(0)
    return clean_json.strip()





