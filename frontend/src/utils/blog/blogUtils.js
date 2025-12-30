export function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
}

export function getRelatedPosts(currentPost, allPosts, limit = 3) {
  if (!currentPost) return [];
  
  // Find posts with shared tags
  const related = allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      const sharedTags = post.tags.filter(tag => currentPost.tags.includes(tag));
      return { ...post, sharedTagsCount: sharedTags.length };
    })
    .filter(post => post.sharedTagsCount > 0)
    .sort((a, b) => b.sharedTagsCount - a.sharedTagsCount)
    .slice(0, limit);
  
  return related;
}

