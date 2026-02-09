import fs from 'fs';
import path from 'path';

const citiesZip = process.argv[2];
const countryInfoPath = process.argv[3];
const admin1Path = process.argv[4];
const outPath = process.argv[5];

if (!citiesZip || !countryInfoPath || !admin1Path || !outPath) {
  console.error('Usage: node scripts/build_world_cities.mjs <cities15000.zip> <countryInfo.txt> <admin1CodesASCII.txt> <out.json>');
  process.exit(1);
}

function parseCountryInfo(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const parts = line.split('\t');
    const iso2 = parts[0];
    const country = parts[4];
    if (iso2 && country) map.set(iso2, country);
  }
  return map;
}

function parseAdmin1(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line) continue;
    const parts = line.split('\t');
    const key = parts[0]; // e.g. US.NY
    const name = parts[1];
    if (key && name) map.set(key, name);
  }
  return map;
}

const countryMap = parseCountryInfo(fs.readFileSync(countryInfoPath, 'utf8'));
const admin1Map = parseAdmin1(fs.readFileSync(admin1Path, 'utf8'));

// unzip cities15000.zip (single file cities15000.txt)
import { execSync } from 'child_process';
const raw = execSync(`unzip -p ${JSON.stringify(citiesZip)}`, { maxBuffer: 1024 * 1024 * 200 }).toString('utf8');

// cities15000 schema: https://download.geonames.org/export/dump/readme.txt
// Fields: geonameid, name, asciiname, alternatenames, latitude, longitude, feature class, feature code,
// country code, cc2, admin1 code, admin2, admin3, admin4, population, elevation, dem, timezone, modification date

const rows = [];
for (const line of raw.split(/\r?\n/)) {
  if (!line) continue;
  const p = line.split('\t');
  const name = p[1];
  const ascii = p[2];
  const country = p[8];
  const admin1 = p[10];
  const pop = Number(p[14] || 0);
  if (!name || !country) continue;

  const countryName = countryMap.get(country) || country;
  const admin1Name = admin1Map.get(`${country}.${admin1}`) || '';

  // label format: City, Region, Country (if region exists)
  const city = String(ascii || name).trim();
  const label = admin1Name ? `${city}, ${admin1Name}, ${countryName}` : `${city}, ${countryName}`;

  rows.push({ label, city, country, countryName, admin1: admin1 || '', admin1Name, pop });
}

// de-dupe by label, keep max pop
const best = new Map();
for (const r of rows) {
  const prev = best.get(r.label);
  if (!prev || (r.pop || 0) > (prev.pop || 0)) best.set(r.label, r);
}

const out = Array.from(best.values());
// sort by population desc for better suggestions
out.sort((a,b) => (b.pop||0) - (a.pop||0));

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ version: 'geonames-cities15000', count: out.length, rows: out }, null, 2));
console.log(`Wrote ${out.length} rows to ${outPath}`);
