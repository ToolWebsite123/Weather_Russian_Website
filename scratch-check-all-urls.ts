async function testVariousUrls() {
  const urls = [
    "https://weather-russian-website.vercel.app/",
    "https://weather-russian-website.vercel.app/gorod",
    "https://weather-russian-website.vercel.app/weather-moscow-1",
    "https://weather-russian-website.vercel.app/weather-moscow-4368",
    "https://weather-russian-website.vercel.app/pogoda/moscow",
    "https://weather-russian-website.vercel.app/weather-saint-petersburg-2"
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

testVariousUrls().catch(console.error);
