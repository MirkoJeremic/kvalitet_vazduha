// Ćirilica -> latinica 
const CYR_TO_LAT = {
  А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Ђ: 'Đ', Е: 'E', Ж: 'Ž', З: 'Z',
  И: 'I', Ј: 'J', К: 'K', Л: 'L', Љ: 'Lj', М: 'M', Н: 'N', Њ: 'Nj', О: 'O',
  П: 'P', Р: 'R', С: 'S', Т: 'T', Ћ: 'Ć', У: 'U', Ф: 'F', Х: 'H', Ц: 'C',
  Ч: 'Č', Џ: 'Dž', Ш: 'Š',
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž', з: 'z',
  и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', ћ: 'ć', у: 'u', ф: 'f', х: 'h', ц: 'c',
  ч: 'č', џ: 'dž', ш: 'š',
}

const CYR_RE = /[Ѐ-ӿ]/

export function toLatin(str) {
  if (!str || !CYR_RE.test(str)) return str ?? ''
  let out = ''
  for (const ch of str) out += CYR_TO_LAT[ch] ?? ch
  return out
}

const EXONYMS = {
  peking: 'Beijing',
  kanton: 'Guangzhou',
  rim: 'Rome',
  napulj: 'Naples',
  venecija: 'Venice',
  beč: 'Vienna',
  minhen: 'Munich',
  keln: 'Cologne',
  njujork: 'New York',
  kairo: 'Cairo',
  atina: 'Athens',
  lisabon: 'Lisbon',
  ženeva: 'Geneva',
  varšava: 'Warsaw',
  bukurešt: 'Bucharest',
  solun: 'Thessaloniki',
  jerusalim: 'Jerusalem',
  damask: 'Damascus',
  hag: 'The Hague',
}

export function resolveExonym(query) {
  const key = query.trim().toLowerCase()
  return EXONYMS[key] ?? query
}
