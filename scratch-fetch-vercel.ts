async function checkVercelLive() {
  const urls = [
    "https://weather-russian-website.vercel.app/weather-faisalabad-saddar-tehsil/10-days",
    "https://weather-russian-website.vercel.app/weather-moscow-4368",
    "https://weather-russian-website.vercel.app/weather-cairo",
    "https://weather-russian-website.vercel.app/weather-feisalabad",
    "https://weather-russian-website.vercel.app/weather-faisalabad-saddar-tehsil"
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const text = await res.text();
      const isNotFound = text.includes("Город не найден") || text.includes("City not found");
      const titleMatch = text.match(/<title>(.*?)<\/title>/i);
      console.log(`URL: ${url}`);
      console.log(`  Status: ${res.status}`);
      console.log(`  Title: ${titleMatch ? titleMatch[1] : "N/A"}`);
      console.log(`  Is "City not found"?: ${isNotFound}`);
      console.log("-----------------------------------------");
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
    }
  }
}

checkVercelLive().catch(console.error);
