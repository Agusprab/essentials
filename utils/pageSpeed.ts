export const fetchPageSpeedData = async (url: string, language: string = 'id') => {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=AIzaSyCS5HXo4toefx5X-A5koYPnxflAiWebG9c&strategy=desktop&category=performance&category=seo&category=best-practices&category=accessibility&locale=${language}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching PageSpeed data:', error);
    return null;
  }
};

export const processPageSpeedData = (data: any) => {
  let overallScore = 92; // default
  let performanceScore = 0;
  let seoScore = 0;
  let bestPracticesScore = 0;
  let accessibilityScore = 0;
  let issues: any[] = [];

  if (data && data.lighthouseResult && data.lighthouseResult.categories) {
    const categories = data.lighthouseResult.categories;
    performanceScore = Math.round((categories.performance?.score || 0) * 100);
    seoScore = Math.round((categories.seo?.score || 0) * 100);
    bestPracticesScore = Math.round((categories['best-practices']?.score || 0) * 100);
    accessibilityScore = Math.round((categories.accessibility?.score || 0) * 100);
    overallScore = Math.round((performanceScore + seoScore + bestPracticesScore + accessibilityScore) / 4);

    // Extract issues from audits
    if (data.lighthouseResult.audits) {
      const audits = data.lighthouseResult.audits;
      issues = Object.values(audits)
        .filter((audit: any) => audit.score !== null && audit.score < 0.9 && audit.score > 0)
        .slice(0, 5) // Limit to 5 issues
        .map((audit: any) => ({
          title: audit.title,
          description: audit.description,
          score: Math.round(audit.score * 100),
          displayValue: audit.displayValue,
          details: audit.details?.items || []
        }));
    }
  }

  return {
    overallScore,
    performanceScore,
    seoScore,
    bestPracticesScore,
    accessibilityScore,
    issues
  };
};