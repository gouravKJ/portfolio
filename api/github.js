export default async function githubHandler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const urlParams = new URLSearchParams((req.url || '').split('?')[1] || '');
  const username = urlParams.get('user') || 'gouravKJ';

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      const query = `
        query {
          user(login: "${username}") {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    contributionLevel
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      if (!data.errors && data.data?.user?.contributionsCollection?.contributionCalendar) {
        const calendar = data.data.user.contributionsCollection.contributionCalendar;
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
        res.end(JSON.stringify({
          total: calendar.totalContributions,
          weeks: calendar.weeks
        }));
        return;
      }
    } catch (e) {}
  }

  try {
    const fallbackRes = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`);
    const fallbackData = await fallbackRes.json();
    const total = Object.values(fallbackData.total || {}).reduce((a, b) => a + b, 0);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.end(JSON.stringify({
      total: total || 0,
      contributions: fallbackData.contributions || []
    }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Failed to fetch GitHub data" }));
  }
}
