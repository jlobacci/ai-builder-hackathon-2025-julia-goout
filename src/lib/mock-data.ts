/**
 * Mock data store for presentation mode.
 * Replaces all Supabase backend calls with in-memory data.
 */

// ── Users ──────────────────────────────────────────────────────────

export const MOCK_USERS = {
  julia: {
    id: 'usr-julia-001',
    email: 'julia@goout.com',
  },
  marcos: {
    id: 'usr-marcos-002',
    email: 'marcos@goout.com',
  },
  camila: {
    id: 'usr-camila-003',
    email: 'camila@goout.com',
  },
  pedro: {
    id: 'usr-pedro-004',
    email: 'pedro@goout.com',
  },
};

// ── Profiles ───────────────────────────────────────────────────────

export const MOCK_PROFILES = [
  {
    user_id: MOCK_USERS.julia.id,
    display_name: 'Julia Bacci',
    handle: 'jubacci',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
    bio: 'Apaixonada por esportes ao ar livre, fotografia e café. Sempre em busca de novas aventuras e amizades genuínas. 🌿📸☕',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    verified: true,
    created_at: '2025-01-15T10:00:00Z',
    radius_km: 30,
    other_hobbies: 'Escalada, Slackline',
    lat: -23.55,
    lng: -46.63,
    contact_whatsapp: null,
    cpf: null,
  },
  {
    user_id: MOCK_USERS.marcos.id,
    display_name: 'Marcos Silva',
    handle: 'marcoss',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    bio: 'Corredor amador e entusiasta de café especial. Sempre topando um pedal no fim de semana!',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    verified: true,
    created_at: '2025-02-01T10:00:00Z',
    radius_km: 20,
    other_hobbies: null,
    lat: -23.56,
    lng: -46.64,
    contact_whatsapp: null,
    cpf: null,
  },
  {
    user_id: MOCK_USERS.camila.id,
    display_name: 'Camila Rocha',
    handle: 'camilar',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    bio: 'Yoga, meditação e trilhas. Buscando equilíbrio e conexões reais.',
    city: 'Rio de Janeiro',
    state: 'RJ',
    country: 'Brasil',
    verified: true,
    created_at: '2025-02-10T10:00:00Z',
    radius_km: 25,
    other_hobbies: 'Meditação',
    lat: -22.9,
    lng: -43.17,
    contact_whatsapp: null,
    cpf: null,
  },
  {
    user_id: MOCK_USERS.pedro.id,
    display_name: 'Pedro Mendes',
    handle: 'pedromendes',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    bio: 'Fotógrafo e violonista. Sempre em busca do próximo pôr do sol perfeito.',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    verified: false,
    created_at: '2025-03-01T10:00:00Z',
    radius_km: 15,
    other_hobbies: null,
    lat: -23.54,
    lng: -46.62,
    contact_whatsapp: null,
    cpf: null,
  },
];

// ── Hobbies ────────────────────────────────────────────────────────

export const MOCK_HOBBIES = [
  { id: 1, name: 'Corrida', slug: 'corrida' },
  { id: 2, name: 'Ciclismo', slug: 'ciclismo' },
  { id: 3, name: 'Yoga', slug: 'yoga' },
  { id: 4, name: 'Fotografia', slug: 'fotografia' },
  { id: 5, name: 'Violão', slug: 'violao' },
  { id: 6, name: 'Café Especial', slug: 'cafe-especial' },
  { id: 7, name: 'Trilha', slug: 'trilha' },
  { id: 8, name: 'Tênis', slug: 'tenis' },
  { id: 9, name: 'Leitura', slug: 'leitura' },
  { id: 10, name: 'Culinária', slug: 'culinaria' },
];

// ── User Hobbies ───────────────────────────────────────────────────

export const MOCK_USER_HOBBIES = [
  { user_id: MOCK_USERS.julia.id, hobby_id: 1, level: 'intermediário', hobbies: MOCK_HOBBIES[0] },
  { user_id: MOCK_USERS.julia.id, hobby_id: 4, level: 'avançado', hobbies: MOCK_HOBBIES[3] },
  { user_id: MOCK_USERS.julia.id, hobby_id: 6, level: 'iniciante', hobbies: MOCK_HOBBIES[5] },
  { user_id: MOCK_USERS.julia.id, hobby_id: 7, level: 'intermediário', hobbies: MOCK_HOBBIES[6] },
  { user_id: MOCK_USERS.marcos.id, hobby_id: 1, level: 'avançado', hobbies: MOCK_HOBBIES[0] },
  { user_id: MOCK_USERS.marcos.id, hobby_id: 2, level: 'intermediário', hobbies: MOCK_HOBBIES[1] },
  { user_id: MOCK_USERS.marcos.id, hobby_id: 6, level: 'avançado', hobbies: MOCK_HOBBIES[5] },
  { user_id: MOCK_USERS.camila.id, hobby_id: 3, level: 'avançado', hobbies: MOCK_HOBBIES[2] },
  { user_id: MOCK_USERS.camila.id, hobby_id: 7, level: 'intermediário', hobbies: MOCK_HOBBIES[6] },
  { user_id: MOCK_USERS.pedro.id, hobby_id: 4, level: 'avançado', hobbies: MOCK_HOBBIES[3] },
  { user_id: MOCK_USERS.pedro.id, hobby_id: 5, level: 'intermediário', hobbies: MOCK_HOBBIES[4] },
];

// ── Outs (Invites) ─────────────────────────────────────────────────

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const in2Weeks = new Date();
in2Weeks.setDate(in2Weeks.getDate() + 14);

const formatDate = (d: Date) => d.toISOString().split('T')[0];

export const MOCK_INVITES = [
  {
    id: 1,
    author_id: MOCK_USERS.julia.id,
    title: 'Corrida matinal no Ibirapuera',
    description: 'Vamos correr juntos no Parque Ibirapuera! Ritmo leve, 5km. Todos os níveis são bem-vindos. Traga água e disposição!',
    hobby_id: 1,
    custom_hobby: null,
    mode: 'presencial',
    city: 'São Paulo',
    lat: -23.58,
    lng: -46.65,
    radius_km: 5,
    time_window: null,
    time_label: `${formatDate(tomorrow)} 07:00–08:30`,
    time_is_fixed: true,
    materials: 'Tênis de corrida, garrafa d\'água',
    bring_own_materials: true,
    slots: 4,
    slots_taken: 2,
    payment_type: 'gratuito',
    price: null,
    created_at: '2026-03-20T14:00:00Z',
  },
  {
    id: 2,
    author_id: MOCK_USERS.marcos.id,
    title: 'Pedal até a Cantareira',
    description: 'Saída do metrô Tucuruvi rumo à Serra da Cantareira. Aproximadamente 30km ida e volta. Nível intermediário.',
    hobby_id: 2,
    custom_hobby: null,
    mode: 'presencial',
    city: 'São Paulo',
    lat: -23.47,
    lng: -46.62,
    radius_km: 10,
    time_window: null,
    time_label: `${formatDate(nextWeek)} 06:30–11:00`,
    time_is_fixed: true,
    materials: 'Bicicleta, capacete, kit reparo',
    bring_own_materials: true,
    slots: 5,
    slots_taken: 3,
    payment_type: 'gratuito',
    price: null,
    created_at: '2026-03-19T10:00:00Z',
  },
  {
    id: 3,
    author_id: MOCK_USERS.camila.id,
    title: 'Aula de Yoga ao ar livre',
    description: 'Yoga para todos os níveis no Parque Villa-Lobos. Traga seu tapetinho! Vamos praticar Hatha Yoga com foco em respiração.',
    hobby_id: 3,
    custom_hobby: null,
    mode: 'presencial',
    city: 'São Paulo',
    lat: -23.54,
    lng: -46.73,
    radius_km: 5,
    time_window: null,
    time_label: `${formatDate(nextWeek)} 08:00–09:30`,
    time_is_fixed: true,
    materials: 'Tapete de yoga',
    bring_own_materials: true,
    slots: 5,
    slots_taken: 1,
    payment_type: 'pago',
    price: 25.00,
    created_at: '2026-03-18T15:00:00Z',
  },
  {
    id: 4,
    author_id: MOCK_USERS.pedro.id,
    title: 'Fotowalk na Liberdade',
    description: 'Passeio fotográfico pelo bairro da Liberdade. Vamos capturar a essência do bairro mais oriental de SP! Qualquer câmera serve.',
    hobby_id: 4,
    custom_hobby: null,
    mode: 'presencial',
    city: 'São Paulo',
    lat: -23.56,
    lng: -46.63,
    radius_km: 3,
    time_window: null,
    time_label: `${formatDate(in2Weeks)} 15:00–18:00`,
    time_is_fixed: true,
    materials: null,
    bring_own_materials: false,
    slots: 3,
    slots_taken: 0,
    payment_type: 'gratuito',
    price: null,
    created_at: '2026-03-17T09:00:00Z',
  },
  {
    id: 5,
    author_id: MOCK_USERS.julia.id,
    title: 'Café e conversa sobre fotografia',
    description: 'Bora tomar um café especial e trocar ideias sobre fotografia? Local: Cafeteria Isso Não É Um Café, Vila Madalena.',
    hobby_id: 6,
    custom_hobby: null,
    mode: 'presencial',
    city: 'São Paulo',
    lat: -23.55,
    lng: -46.69,
    radius_km: 5,
    time_window: null,
    time_label: `${formatDate(in2Weeks)} 14:00–16:00`,
    time_is_fixed: false,
    materials: null,
    bring_own_materials: false,
    slots: 3,
    slots_taken: 1,
    payment_type: 'pago',
    price: 15.00,
    created_at: '2026-03-16T11:00:00Z',
  },
];

// ── Invite Slots ───────────────────────────────────────────────────

export const MOCK_INVITE_SLOTS = [
  { id: 1, invite_id: 1, date: formatDate(tomorrow), start_time: '07:00', end_time: '08:30' },
  { id: 2, invite_id: 2, date: formatDate(nextWeek), start_time: '06:30', end_time: '11:00' },
  { id: 3, invite_id: 3, date: formatDate(nextWeek), start_time: '08:00', end_time: '09:30' },
  { id: 4, invite_id: 4, date: formatDate(in2Weeks), start_time: '15:00', end_time: '18:00' },
  { id: 5, invite_id: 5, date: formatDate(in2Weeks), start_time: '14:00', end_time: '16:00' },
];

// ── Applications ───────────────────────────────────────────────────

export const MOCK_APPLICATIONS = [
  {
    id: 1,
    applicant_id: MOCK_USERS.marcos.id,
    invite_id: 1,
    message: 'Quero participar!',
    status: 'aceito',
    created_at: '2026-03-20T16:00:00Z',
  },
  {
    id: 2,
    applicant_id: MOCK_USERS.camila.id,
    invite_id: 1,
    message: 'Adoro correr! Posso ir!',
    status: 'aceito',
    created_at: '2026-03-20T17:00:00Z',
  },
  {
    id: 3,
    applicant_id: MOCK_USERS.julia.id,
    invite_id: 2,
    message: 'Sempre quis fazer esse pedal!',
    status: 'aceito',
    created_at: '2026-03-19T12:00:00Z',
  },
  {
    id: 4,
    applicant_id: MOCK_USERS.pedro.id,
    invite_id: 1,
    message: 'Posso levar minha câmera?',
    status: 'pendente',
    created_at: '2026-03-21T08:00:00Z',
  },
  {
    id: 5,
    applicant_id: MOCK_USERS.julia.id,
    invite_id: 3,
    message: 'Quero experimentar yoga!',
    status: 'aceito',
    created_at: '2026-03-18T18:00:00Z',
  },
];

// ── Connections ────────────────────────────────────────────────────

export const MOCK_CONNECTIONS = [
  {
    id: 1,
    requester_id: MOCK_USERS.julia.id,
    target_id: MOCK_USERS.marcos.id,
    status: 'aceita',
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 2,
    requester_id: MOCK_USERS.camila.id,
    target_id: MOCK_USERS.julia.id,
    status: 'aceita',
    created_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 3,
    requester_id: MOCK_USERS.pedro.id,
    target_id: MOCK_USERS.julia.id,
    status: 'pendente',
    created_at: '2026-03-20T10:00:00Z',
  },
];

// ── Messages ───────────────────────────────────────────────────────

export const MOCK_MESSAGES = [
  {
    id: 1,
    invite_id: 1,
    sender_id: MOCK_USERS.marcos.id,
    body: 'Oi Julia! Animado para a corrida de amanhã!',
    created_at: '2026-03-22T10:00:00Z',
  },
  {
    id: 2,
    invite_id: 1,
    sender_id: MOCK_USERS.julia.id,
    body: 'Oi Marcos! Vai ser ótimo! Vamos nos encontrar na entrada principal do parque.',
    created_at: '2026-03-22T10:05:00Z',
  },
  {
    id: 3,
    invite_id: 1,
    sender_id: MOCK_USERS.camila.id,
    body: 'Eu também vou! Posso levar uma amiga?',
    created_at: '2026-03-22T10:10:00Z',
  },
  {
    id: 4,
    invite_id: 1,
    sender_id: MOCK_USERS.julia.id,
    body: 'Claro, Camila! Quanto mais, melhor 😊',
    created_at: '2026-03-22T10:15:00Z',
  },
  {
    id: 5,
    invite_id: 2,
    sender_id: MOCK_USERS.marcos.id,
    body: 'Julia, o pedal vai ser incrível! Já fiz essa trilha duas vezes.',
    created_at: '2026-03-21T14:00:00Z',
  },
  {
    id: 6,
    invite_id: 2,
    sender_id: MOCK_USERS.julia.id,
    body: 'Que legal! Preciso calibrar os pneus antes. Alguma dica?',
    created_at: '2026-03-21T14:30:00Z',
  },
];

// ── DM Threads ─────────────────────────────────────────────────────

export const MOCK_DM_THREADS = [
  {
    id: 1,
    user_a: MOCK_USERS.julia.id,
    user_b: MOCK_USERS.marcos.id,
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 2,
    user_a: MOCK_USERS.camila.id,
    user_b: MOCK_USERS.julia.id,
    created_at: '2026-03-05T10:00:00Z',
  },
];

// ── DM Messages ────────────────────────────────────────────────────

export const MOCK_DM_MESSAGES = [
  {
    id: 1,
    thread_id: 1,
    sender_id: MOCK_USERS.marcos.id,
    body: 'Oi Julia! Vi que você curte fotografia também. Já conhece o parque Augusta?',
    created_at: '2026-03-20T09:00:00Z',
  },
  {
    id: 2,
    thread_id: 1,
    sender_id: MOCK_USERS.julia.id,
    body: 'Oi Marcos! Conheço sim, é ótimo para fotos! Vamos marcar?',
    created_at: '2026-03-20T09:30:00Z',
  },
  {
    id: 3,
    thread_id: 2,
    sender_id: MOCK_USERS.camila.id,
    body: 'Julia, adorei a corrida! Bora fazer mais atividades juntas?',
    created_at: '2026-03-21T18:00:00Z',
  },
  {
    id: 4,
    thread_id: 2,
    sender_id: MOCK_USERS.julia.id,
    body: 'Com certeza! Tenho um Out de café marcado, vem!',
    created_at: '2026-03-21T18:15:00Z',
  },
];

// ── Posts ───────────────────────────────────────────────────────────

export const MOCK_POSTS = [
  {
    id: 1,
    author_id: MOCK_USERS.julia.id,
    body: 'Primeira corrida do ano no Ibirapuera! Nada como começar o dia com energia positiva e amigos novos. 🏃‍♀️🌅',
    created_at: '2026-03-20T09:00:00Z',
    profiles: MOCK_PROFILES[0],
    post_images: [],
    post_mentions: [],
    v_posts_counts: [{ likes_count: 12, comments_count: 3 }],
    user_liked: false,
  },
  {
    id: 2,
    author_id: MOCK_USERS.marcos.id,
    body: 'Pedal finalizado! 30km de pura adrenalina na Cantareira. Obrigado a todos que participaram! 🚴‍♂️⛰️',
    created_at: '2026-03-19T12:00:00Z',
    profiles: MOCK_PROFILES[1],
    post_images: [],
    post_mentions: [
      { id: 1, mentioned_user_id: MOCK_USERS.julia.id, profiles: MOCK_PROFILES[0] },
    ],
    v_posts_counts: [{ likes_count: 8, comments_count: 2 }],
    user_liked: true,
  },
  {
    id: 3,
    author_id: MOCK_USERS.camila.id,
    body: 'Yoga ao ar livre é outra experiência. O vento, os pássaros, o sol... tudo faz parte da prática. 🧘‍♀️🌿',
    created_at: '2026-03-18T10:00:00Z',
    profiles: MOCK_PROFILES[2],
    post_images: [],
    post_mentions: [],
    v_posts_counts: [{ likes_count: 15, comments_count: 5 }],
    user_liked: false,
  },
  {
    id: 4,
    author_id: MOCK_USERS.julia.id,
    body: 'Descobri uma cafeteria incrível na Vila Madalena! Café coado com grãos do Cerrado mineiro. ☕✨ Quem quer conhecer?',
    created_at: '2026-03-17T15:00:00Z',
    profiles: MOCK_PROFILES[0],
    post_images: [],
    post_mentions: [],
    v_posts_counts: [{ likes_count: 20, comments_count: 7 }],
    user_liked: false,
  },
];

// ── Post Comments ──────────────────────────────────────────────────

export const MOCK_POST_COMMENTS = [
  {
    id: 1,
    post_id: 1,
    author_id: MOCK_USERS.marcos.id,
    body: 'Foi incrível! Bora repetir semana que vem!',
    created_at: '2026-03-20T10:00:00Z',
    profiles: MOCK_PROFILES[1],
  },
  {
    id: 2,
    post_id: 1,
    author_id: MOCK_USERS.camila.id,
    body: 'Quero participar da próxima!',
    created_at: '2026-03-20T11:00:00Z',
    profiles: MOCK_PROFILES[2],
  },
  {
    id: 3,
    post_id: 4,
    author_id: MOCK_USERS.marcos.id,
    body: 'Qual o nome da cafeteria? Preciso conhecer!',
    created_at: '2026-03-17T16:00:00Z',
    profiles: MOCK_PROFILES[1],
  },
];

// ── Notification State ─────────────────────────────────────────────

export const MOCK_NOTIFICATION_STATE = {
  user_id: MOCK_USERS.julia.id,
  last_seen_at: '2026-03-22T08:00:00Z',
  updated_at: '2026-03-22T08:00:00Z',
};

// ── Helper: get profile by user_id ─────────────────────────────────

export function getProfile(userId: string) {
  return MOCK_PROFILES.find(p => p.user_id === userId) || null;
}

export function getProfileByHandle(handle: string) {
  return MOCK_PROFILES.find(p => p.handle === handle) || null;
}

export function getInviteWithRelations(inviteId: number) {
  const invite = MOCK_INVITES.find(i => i.id === inviteId);
  if (!invite) return null;
  
  const author = getProfile(invite.author_id);
  const hobby = MOCK_HOBBIES.find(h => h.id === invite.hobby_id);
  
  return {
    ...invite,
    author: author ? { display_name: author.display_name, avatar_url: author.avatar_url, handle: author.handle, verified: author.verified } : null,
    hobby: hobby ? { name: hobby.name } : null,
  };
}
