export type SportFamilyId = 'team' | 'racket' | 'fitness' | 'combat' | 'endurance' | 'water' | 'outdoor' | 'mind-body' | 'other'
export type SportFamily = { id: SportFamilyId; name: string; description: string; iconKey: string; keywords: string[] }
export const SPORT_FAMILIES: SportFamily[] = [
 {id:'team',name:'Desportos de equipa',description:'Jogos coletivos, clubes e equipas.',iconKey:'ball-sport',keywords:['futebol','futsal','basket','basquet','andebol','handebol','voleibol','volley','rugby','hockey','hóquei','baseball','softball']},
 {id:'racket',name:'Raquetes e precisão',description:'Modalidades com raquete, paddle ou precisão.',iconKey:'target',keywords:['tenis','ténis','padel','badminton','squash','pickleball','tenis de mesa','ténis de mesa','ping pong','golfe','golf']},
 {id:'fitness',name:'Fitness e força',description:'Treino físico, força e condicionamento.',iconKey:'strength',keywords:['fitness','ginásio','ginasio','musculação','musculacao','crossfit','cross training','funcional','powerlifting','halterofilismo','bodybuilding','calistenia']},
 {id:'combat',name:'Combate e artes marciais',description:'Técnica, disciplina e desportos de combate.',iconKey:'competition',keywords:['boxe','boxing','kickboxing','muay thai','judo','judô','karate','karaté','jiu','bjj','mma','taekwondo','capoeira','wrestling','luta']},
 {id:'endurance',name:'Corrida, ciclismo e resistência',description:'Modalidades de endurance e progressão individual.',iconKey:'running',keywords:['corrida','running','atletismo','trail','maratona','ciclismo','bicicleta','cycling','triatlo','triatlon']},
 {id:'water',name:'Água e náutica',description:'Piscina, mar, rio e atividades náuticas.',iconKey:'recovery',keywords:['natação','natacao','swim','surf','bodyboard','kitesurf','windsurf','canoagem','kayak','remo','vela','mergulho','waterpolo','polo aquático']},
 {id:'outdoor',name:'Outdoor e aventura',description:'Natureza, montanha e atividades ao ar livre.',iconKey:'activity',keywords:['escalada','climbing','caminhada','hiking','trekking','montanhismo','orientação','orientacao','skate','patinagem','patins']},
 {id:'mind-body',name:'Corpo e mente',description:'Mobilidade, equilíbrio e bem-estar.',iconKey:'wellness',keywords:['yoga','pilates','alongamento','mobilidade','meditação','meditacao','tai chi','dança','danca']},
 {id:'other',name:'Outras modalidades',description:'Outros desportos e atividades.',iconKey:'trophy',keywords:[]},
]

const PROFESSIONAL_ROLE_PATTERNS = [
 /^treinador(?:\s+de)?\b/i,
 /^instrutor(?:\s+de)?\b/i,
 /^professor(?:\s+de)?\b/i,
 /^coach(?:\s+de)?\b/i,
 /\bcoach$/i,
]

function normalize(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
export function isProfessionalRoleCategory(name:string){const value=normalize(name||'');return PROFESSIONAL_ROLE_PATTERNS.some(pattern=>pattern.test(value))}
export function getSportFamily(name:string):SportFamily{const value=normalize(name||'');return SPORT_FAMILIES.find(f=>f.id!=='other'&&f.keywords.some(k=>value.includes(normalize(k))))||SPORT_FAMILIES[SPORT_FAMILIES.length-1]}
export function groupSports<T extends {name?:string|null}>(sports:T[]){const modalities=sports.filter(s=>!isProfessionalRoleCategory(s.name||''));return SPORT_FAMILIES.map(family=>({...family,sports:modalities.filter(s=>getSportFamily(s.name||'').id===family.id)})).filter(group=>group.sports.length>0)}
