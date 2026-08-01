const { writeFileSync } = require('fs');
const { join } = require('path');
const RU = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
function slugify(name){
  return name.toLowerCase().split('').map(c=>RU[c]??(/[a-z0-9]/.test(c)?c:'-')).join('').replace(/-+/g,'-').replace(/^-|-$/g,'');
}
const raw = require('./ru-cities-raw.json');
const seen = new Set();
const cities = [];
for (const row of raw) {
  const [nameRu, lat, lon, pop, admin1] = row;
  let slug = slugify(nameRu);
  if (seen.has(slug)) slug = slugify(nameRu + '-' + (admin1||''));
  let i = 2;
  while (seen.has(slug)) { slug = slugify(nameRu) + '-' + i++; }
  seen.add(slug);
  cities.push({ slug, nameRu, nameEn: null, country: 'RU', admin1, latitude: +lat, longitude: +lon, timezone: null, population: +pop });
}
writeFileSync(join(__dirname,'ru-cities.json'), JSON.stringify(cities,null,2));
console.log('Wrote', cities.length, 'cities');
