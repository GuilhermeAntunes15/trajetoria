import {
  PrismaClient,
  type EventType,
  type EvidenceType,
  type NotificationType,
  type ProjectStatus,
  type Role,
  type Visibility,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { seedDefaultSkills } from "../src/lib/default-skills";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "trajetoria123";
const SCHOOL_SLUG = "ee-conselheiro-crispiniano";
const LEGACY_SCHOOL_SLUG = "ee-horizonte";

type SeedUser = {
  key: string;
  email: string;
  username: string;
  name: string;
  role: Role;
  bio: string;
  profileVisibility: Visibility;
  student?: {
    course: string;
    gradeYear: string;
    classroomKey: string;
    interests: string[];
  };
  teacher?: { subject: string; title: string };
};

const SEED_USERS: SeedUser[] = [
  {
    key: "admin",
    email: "admin@horizonte.edu.br",
    username: "beatriz.nogueira",
    name: "Beatriz Nogueira",
    role: "ADMIN",
    bio: "Coordenadora pedagógica. Cuido dos registros e dos eventos da escola.",
    profileVisibility: "PRIVATE",
  },
  {
    key: "teacher",
    email: "professor@horizonte.edu.br",
    username: "carlos.menezes",
    name: "Carlos Menezes",
    role: "TEACHER",
    bio: "Professor de programação e projetos integradores. Oriento equipes no laboratório.",
    profileVisibility: "SCHOOL",
    teacher: { subject: "Desenvolvimento de Sistemas", title: "Prof." },
  },
  {
    key: "joao",
    email: "joao@horizonte.edu.br",
    username: "joao.silva",
    name: "João Silva",
    role: "STUDENT",
    bio: "Tenho interesse em backend, dados e soluções para problemas sociais.",
    profileVisibility: "PUBLIC",
    student: {
      course: "Desenvolvimento de Sistemas",
      gradeYear: "2º ano",
      classroomKey: "2A",
      interests: ["Desenvolvimento de Sistemas", "Ciência de Dados", "Pesquisa"],
    },
  },
  {
    key: "maria",
    email: "maria@horizonte.edu.br",
    username: "maria.santos",
    name: "Maria Santos",
    role: "STUDENT",
    bio: "Estudo design de interface e acessibilidade. Gosto de entender como as pessoas usam as coisas.",
    profileVisibility: "PRIVATE",
    student: {
      course: "Desenvolvimento de Sistemas",
      gradeYear: "2º ano",
      classroomKey: "2A",
      interests: ["Design", "Desenvolvimento de Sistemas", "Comunicação"],
    },
  },
  {
    key: "ana",
    email: "ana@horizonte.edu.br",
    username: "ana.oliveira",
    name: "Ana Oliveira",
    role: "STUDENT",
    bio: "Gosto de pesquisa, ciências e projetos que resolvem problemas de verdade.",
    profileVisibility: "PUBLIC",
    student: {
      course: "Desenvolvimento de Sistemas",
      gradeYear: "2º ano",
      classroomKey: "2B",
      interests: ["Ciências", "Sustentabilidade", "Pesquisa"],
    },
  },
];

const CLASSROOMS = [
  {
    key: "2A",
    name: "2º A - Desenvolvimento de Sistemas",
    legacyName: "3º A - Desenvolvimento de Sistemas",
    year: 2026,
  },
  {
    key: "2B",
    name: "2º B - Desenvolvimento de Sistemas",
    legacyName: "2º B - Ciências",
    year: 2026,
  },
];

type SeedEvent = {
  key: string;
  slug: string;
  legacySlug?: string;
  name: string;
  type: EventType;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  coverImageUrl: string | null;
};

const EVENTS: SeedEvent[] = [
  {
    key: "hackathon",
    slug: "hackathon-experimenta-2026",
    legacySlug: "hackathon-horizonte-2026",
    name: "Hackathon Experimenta",
    type: "HACKATHON",
    description:
      "Hackathon promovido pela Prefeitura de Guarulhos, com desafios trazidos pelas secretarias da cidade. As equipes escolhem um desafio na abertura, desenvolvem durante três dias e apresentam o protótipo para uma banca de servidores municipais e professores.",
    startDate: new Date("2026-04-10T12:00:00.000Z"),
    endDate: new Date("2026-04-12T12:00:00.000Z"),
    location: "Prefeitura de Guarulhos",
    coverImageUrl: "/seed/evento-hackathon.svg",
  },
  {
    key: "doencas-raras",
    slug: "hackathon-doencas-raras-2026",
    name: "Hackathon Doenças Raras",
    type: "HACKATHON",
    description:
      "Maratona de tecnologia dedicada à jornada de quem convive com uma doença rara, do diagnóstico ao acompanhamento. Os times trabalham ao lado de famílias e profissionais de saúde para construir soluções que encurtem esse caminho.",
    startDate: new Date("2026-08-07T12:00:00.000Z"),
    endDate: new Date("2026-08-09T12:00:00.000Z"),
    location: "Guarulhos",
    coverImageUrl: "/seed/evento-hackathon.svg",
  },
  {
    key: "congresso",
    slug: "congresso-dos-tecnicos-2026",
    name: "Congresso dos Técnicos",
    type: "OTHER",
    description:
      "Dois dias em que as turmas dos cursos técnicos apresentam seus projetos para a comunidade escolar, para as famílias e para convidados do mercado. Cada equipe tem um horário no auditório e responde às perguntas da plateia.",
    startDate: new Date("2026-06-18T12:00:00.000Z"),
    endDate: new Date("2026-06-19T12:00:00.000Z"),
    location: "Auditório da escola",
    coverImageUrl: "/seed/evento-feira.svg",
  },
  {
    key: "feceg",
    slug: "feceg-2026",
    name: "FECEG",
    type: "SCIENCE_FAIR",
    description:
      "FECEG — Feira de Ciências e Engenharia de Guarulhos, que reúne projetos de investigação das escolas do município. Os trabalhos selecionados passam por avaliação de uma banca e concorrem a credenciamento para feiras estaduais.",
    startDate: new Date("2026-09-24T12:00:00.000Z"),
    endDate: new Date("2026-09-26T12:00:00.000Z"),
    location: "Guarulhos",
    coverImageUrl: "/seed/evento-feira.svg",
  },
  {
    key: "feira",
    slug: "feira-de-ciencias-2026",
    name: "Feira de Ciências da Escola",
    type: "SCIENCE_FAIR",
    description:
      "Mostra anual dos projetos de investigação das turmas do técnico em Desenvolvimento de Sistemas. Cada equipe monta um estande na quadra, explica o método e recebe perguntas do público.",
    startDate: new Date("2026-10-15T12:00:00.000Z"),
    endDate: new Date("2026-10-17T12:00:00.000Z"),
    location: "Quadra da escola",
    coverImageUrl: "/seed/evento-feira.svg",
  },
];

type SeedProject = {
  key: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  problem: string;
  solution: string;
  learnings: string;
  area: string;
  status: ProjectStatus;
  visibility: Visibility;
  isFeatured: boolean;
  allowFork: boolean;
  coverImageUrl: string | null;
  projectDate: Date;
  eventKey?: string;
  isHighlight?: boolean;
  advisorKey: string | null;
  submittedAt: Date | null;
  validatedAt: Date | null;
  members: { userKey: string; role: string; contribution: string; isOwner?: boolean }[];
  skills: { name: string; verified: boolean }[];
  evidences: { type: EvidenceType; title: string; description: string; url: string }[];
};

const PROJECTS: SeedProject[] = [
  {
    key: "enchentes",
    slug: "sistema-de-monitoramento-de-enchentes",
    title: "Sistema de Monitoramento de Enchentes",
    summary:
      "Sensores no córrego do bairro e um painel que avisa moradores quando o nível da água sobe rápido demais.",
    description:
      "Projeto desenvolvido durante o Hackathon Experimenta, em três dias de trabalho na Prefeitura de Guarulhos com apoio da defesa civil do município.",
    problem:
      "O córrego que passa atrás da escola transborda pelo menos duas vezes por ano. Quando isso acontece, as famílias das ruas mais baixas só percebem quando a água já entrou em casa. A prefeitura mantém um boletim de chuva, mas ele fala da cidade inteira e não do nosso trecho. Faltava um aviso local, com antecedência suficiente para tirar móveis e documentos do chão.",
    solution:
      "Montamos dois sensores ultrassônicos em pontos diferentes do córrego, ligados a um Arduino que envia a leitura a cada cinco minutos. Uma API em Python recebe os dados, compara com o nível histórico e classifica a situação em normal, atenção ou alerta. O painel web mostra o nível atual, o gráfico das últimas horas e um aviso grande quando a faixa muda. Quem se cadastra recebe a mudança de faixa por mensagem, sem precisar abrir o site.",
    learnings:
      "Aprendemos que o sensor erra quando chove forte e que era preciso descartar leituras fora da curva antes de alertar. Descobrimos também que a parte mais difícil não era o código, e sim decidir a partir de qual altura vale a pena acordar alguém de madrugada. Conversamos com cinco moradores antes de fechar o texto do alerta, e isso mudou completamente a linguagem do aviso. No fim, o protótipo ficou simples de propósito: quanto menos telas, mais gente consegue usar.",
    area: "Desenvolvimento de Sistemas",
    status: "APPROVED",
    visibility: "PUBLIC",
    isFeatured: true,
    allowFork: true,
    coverImageUrl: "/seed/projeto-enchentes.svg",
    projectDate: new Date("2026-04-12T12:00:00.000Z"),
    eventKey: "hackathon",
    isHighlight: true,
    advisorKey: "teacher",
    submittedAt: new Date("2026-04-13T14:30:00.000Z"),
    validatedAt: new Date("2026-04-15T10:15:00.000Z"),
    members: [
      {
        userKey: "joao",
        role: "Backend",
        contribution:
          "Construí a API em Python que recebe as leituras dos sensores e classifica o nível do córrego. Também cuidei do banco de dados e do envio das mensagens de alerta.",
        isOwner: true,
      },
      {
        userKey: "maria",
        role: "UX/UI",
        contribution:
          "Desenhei o painel no Figma e escrevi os textos dos avisos. Testei as telas com moradores para garantir que o alerta fosse entendido sem explicação.",
      },
      {
        userKey: "ana",
        role: "Dados",
        contribution:
          "Levantei o histórico de chuvas do bairro e defini as faixas de atenção e alerta a partir das medições feitas nos três dias.",
      },
    ],
    skills: [
      { name: "Python", verified: true },
      { name: "APIs", verified: true },
      { name: "Comunicação", verified: true },
      { name: "Arduino", verified: true },
      { name: "Figma", verified: false },
    ],
    evidences: [
      {
        type: "GITHUB",
        title: "Repositório do projeto",
        description: "Código da API, do firmware do Arduino e do painel web.",
        url: "https://github.com/ee-crispiniano/monitor-enchentes",
      },
      {
        type: "PRESENTATION",
        title: "Apresentação da banca",
        description: "Slides usados na apresentação final do hackathon.",
        url: "https://docs.google.com/presentation/d/1f8Qk2mVmonitorEnchentesCrispiniano/edit",
      },
      {
        type: "VIDEO",
        title: "Demonstração do protótipo",
        description: "Vídeo de três minutos mostrando o sensor e o painel reagindo à subida do nível.",
        url: "https://www.youtube.com/watch?v=8Hq2LmVjR4s",
      },
    ],
  },
  {
    key: "horta",
    slug: "horta-inteligente",
    title: "Horta Inteligente",
    summary:
      "Irrigação automática da horta da escola a partir da umidade real do solo, com registro diário do consumo de água.",
    description:
      "Projeto de investigação apresentado na Feira de Ciências da Escola, desenvolvido ao longo de um bimestre no canteiro atrás do refeitório.",
    problem:
      "A horta da escola é regada por escala, sempre no mesmo horário e com a mesma quantidade de água. Em semana de chuva o canteiro encharca e as mudas de alface apodrecem. Em semana quente, a rega da manhã não chega até o fim da tarde. Ninguém tinha um número confiável sobre quanta água a horta realmente consome.",
    solution:
      "Instalamos sensores de umidade em três pontos do canteiro e uma válvula ligada a um relé. O Arduino só abre a válvula quando a umidade fica abaixo da faixa que definimos para cada cultura. Cada rega é registrada com data, duração e litros estimados, o que permite comparar os meses. Depois de seis semanas de teste, o consumo caiu e as perdas de muda diminuíram bastante.",
    learnings:
      "Aprendemos a calibrar o sensor de umidade com amostras de solo secas em estufa, porque o valor bruto não significava nada sozinho. Também entendemos por que uma medição em um ponto só não representa o canteiro inteiro. Errar a posição da válvula na primeira montagem custou duas semanas e ensinou a testar o circuito antes de fixar tudo. A parte mais bonita foi ver o dado confirmando uma coisa que a gente só suspeitava.",
    area: "Sustentabilidade",
    status: "APPROVED",
    visibility: "SCHOOL",
    isFeatured: false,
    allowFork: true,
    coverImageUrl: "/seed/projeto-horta.svg",
    projectDate: new Date("2026-10-16T12:00:00.000Z"),
    eventKey: "feira",
    isHighlight: true,
    advisorKey: "teacher",
    submittedAt: new Date("2026-10-18T09:00:00.000Z"),
    validatedAt: new Date("2026-10-20T16:40:00.000Z"),
    members: [
      {
        userKey: "ana",
        role: "Pesquisa",
        contribution:
          "Conduzi a calibração dos sensores, organizei as medições semanais e escrevi o relatório comparando o consumo antes e depois.",
        isOwner: true,
      },
      {
        userKey: "maria",
        role: "Design",
        contribution:
          "Montei os painéis do estande e o esquema visual do circuito para explicar o funcionamento a quem não é da área técnica.",
      },
    ],
    skills: [
      { name: "Arduino", verified: true },
      { name: "Pesquisa", verified: true },
      { name: "Eletrônica", verified: false },
    ],
    evidences: [
      {
        type: "DOCUMENT",
        title: "Relatório de medições",
        description: "Planilha e texto com as seis semanas de acompanhamento do canteiro.",
        url: "https://docs.google.com/document/d/1hortaInteligenteCrispinianoRelatorio/edit",
      },
      {
        type: "GITHUB",
        title: "Código do controlador",
        description: "Firmware do Arduino com a lógica de calibração e de abertura da válvula.",
        url: "https://github.com/ee-crispiniano/horta-inteligente",
      },
    ],
  },
  {
    key: "acessibilidade",
    slug: "mapa-de-acessibilidade-urbana",
    title: "Mapa de Acessibilidade Urbana",
    summary:
      "Mapa colaborativo das calçadas do entorno da escola, com os pontos que impedem a passagem de cadeira de rodas.",
    description:
      "Projeto em andamento para a Feira de Ciências da Escola, feito em parceria com a turma do 2º B e com duas famílias do bairro.",
    problem:
      "Um colega que usa cadeira de rodas leva quase o dobro do tempo para chegar à escola porque precisa desviar de calçadas quebradas. Esse tipo de informação não está em nenhum mapa. Quem precisa dela descobre na hora, no meio do caminho, e às vezes tem que voltar. Queríamos registrar o problema com endereço e foto, para ter algo concreto para levar à subprefeitura.",
    solution:
      "Criamos um formulário simples em que qualquer pessoa marca um ponto no mapa, escolhe o tipo de barreira e envia uma foto. Os registros aparecem em um mapa com cores por gravidade e podem ser filtrados por rua. Levantamos as oito quadras ao redor da escola em dois sábados. A ideia é entregar o relatório com os pontos críticos para a subprefeitura no fim do semestre.",
    learnings:
      "Aprendemos que descrever uma barreira é mais difícil do que parece: rampa alta demais e guia rebaixada quebrada são problemas diferentes e precisavam de categorias separadas. Também percebemos que fotos sem ponto de referência não ajudam ninguém. Fazer o levantamento acompanhados de quem usa cadeira mudou o que consideramos grave.",
    area: "Design",
    status: "SUBMITTED",
    visibility: "SCHOOL",
    isFeatured: false,
    allowFork: true,
    coverImageUrl: "/seed/projeto-acessibilidade.svg",
    projectDate: new Date("2026-10-16T12:00:00.000Z"),
    eventKey: "feira",
    advisorKey: "teacher",
    submittedAt: new Date("2026-10-19T11:20:00.000Z"),
    validatedAt: null,
    members: [
      {
        userKey: "maria",
        role: "Front-end",
        contribution:
          "Desenvolvi a interface do mapa e o formulário de registro, cuidando para que funcionasse bem no celular durante o levantamento em campo.",
        isOwner: true,
      },
      {
        userKey: "joao",
        role: "Dados",
        contribution:
          "Organizei os registros coletados, tratei as coordenadas repetidas e montei o resumo por rua que vai para a subprefeitura.",
      },
    ],
    skills: [
      { name: "JavaScript", verified: false },
      { name: "Figma", verified: false },
      { name: "Pesquisa", verified: false },
    ],
    evidences: [
      {
        type: "WEBSITE",
        title: "Mapa em desenvolvimento",
        description: "Versão de testes publicada para o levantamento em campo.",
        url: "https://mapa-acessibilidade-crispiniano.vercel.app",
      },
    ],
  },
  {
    key: "dashboard",
    slug: "dashboard-de-indicadores-escolares",
    title: "Dashboard de Indicadores Escolares",
    summary:
      "Painel com frequência, notas e participação em projetos, para a coordenação enxergar a turma antes do conselho de classe.",
    description:
      "Projeto integrador do 2º A, apresentado no Congresso dos Técnicos e construído a partir das planilhas que a secretaria já mantém.",
    problem:
      "A coordenação acompanha frequência em uma planilha, notas em outra e participação em projetos no caderno. Quando chega o conselho de classe, juntar tudo leva dias. Casos que precisavam de atenção apareciam tarde demais. O dado existia, mas estava espalhado.",
    solution:
      "Modelamos um banco único com as três fontes e escrevemos consultas SQL para os indicadores que a coordenação pediu. O painel mostra frequência por turma, evolução das médias e quantos alunos participaram de algum projeto no bimestre. Também marcamos em destaque os casos que passam do limite combinado de faltas.",
    learnings:
      "Aprendemos que limpar dado bagunçado é a maior parte do trabalho: nome escrito de três jeitos diferentes quebrava o cruzamento. Entendemos a diferença entre mostrar muito número e mostrar o número útil. A primeira versão tinha gráficos demais e a coordenação não conseguia responder à pergunta que importava.",
    area: "Ciência de Dados",
    status: "CHANGES_REQUESTED",
    visibility: "SCHOOL",
    isFeatured: false,
    allowFork: true,
    coverImageUrl: null,
    projectDate: new Date("2026-06-19T12:00:00.000Z"),
    eventKey: "congresso",
    advisorKey: "teacher",
    submittedAt: new Date("2026-06-21T08:45:00.000Z"),
    validatedAt: null,
    members: [
      {
        userKey: "joao",
        role: "Dados",
        contribution:
          "Modelei o banco, escrevi as consultas dos indicadores e montei o painel com a coordenação acompanhando cada versão.",
        isOwner: true,
      },
    ],
    skills: [
      { name: "SQL", verified: false },
      { name: "Análise de Dados", verified: false },
    ],
    evidences: [
      {
        type: "GITHUB",
        title: "Repositório do painel",
        description: "Consultas SQL, scripts de carga e código do painel.",
        url: "https://github.com/ee-crispiniano/dashboard-indicadores",
      },
    ],
  },
  {
    key: "carona",
    slug: "aplicativo-de-carona-escolar",
    title: "Aplicativo de Carona Escolar",
    summary:
      "Combinação de caronas entre famílias que já fazem o mesmo trajeto até a escola, com confirmação do responsável.",
    description: "Rascunho do projeto que será apresentado no próximo projeto integrador.",
    problem:
      "Muita família faz o mesmo caminho até a escola todos os dias, sozinha no carro. A combinação de carona hoje acontece no grupo de mensagens e se perde no meio das conversas. Quem chega depois nunca sabe quais trajetos já existem.",
    solution:
      "A ideia é cadastrar trajetos fixos por bairro e horário, deixando o responsável confirmar cada combinação. Nada de localização em tempo real: só o ponto de encontro e o horário combinado. A lista de trajetos fica visível apenas para famílias da escola.",
    learnings:
      "Ainda estamos no começo. Até agora a discussão mais importante foi sobre privacidade: decidimos não guardar endereço exato, apenas o ponto de encontro escolhido pela família.",
    area: "Desenvolvimento de Sistemas",
    status: "DRAFT",
    visibility: "PRIVATE",
    isFeatured: false,
    allowFork: false,
    coverImageUrl: null,
    projectDate: new Date("2026-08-05T12:00:00.000Z"),
    advisorKey: null,
    submittedAt: null,
    validatedAt: null,
    members: [
      {
        userKey: "joao",
        role: "Ideia e protótipo",
        contribution: "Escrevi a proposta inicial e montei o protótipo das telas para discutir com a turma.",
        isOwner: true,
      },
    ],
    skills: [{ name: "Organização", verified: false }],
    evidences: [
      {
        type: "LINK",
        title: "Protótipo das telas",
        description: "Fluxo navegável com as três telas principais do aplicativo.",
        url: "https://www.figma.com/proto/caronaEscolarCrispiniano/prototipo",
      },
    ],
  },
];

const BADGES = [
  {
    key: "destaque",
    slug: "projeto-destaque",
    name: "Projeto Destaque",
    description: "Concedida a projetos escolhidos pela escola como referência para as próximas turmas.",
    icon: "trophy",
    type: "HIGHLIGHT" as const,
  },
  {
    key: "hackathon",
    slug: "hackathon",
    name: "Hackathon",
    description: "Participação completa em um hackathon da escola, da abertura à apresentação final.",
    icon: "code",
    type: "EVENT" as const,
  },
  {
    key: "feira",
    slug: "feira-de-ciencias",
    name: "Feira de Ciências",
    description: "Participação na Feira de Ciências com estande e apresentação para o público.",
    icon: "flask-conical",
    type: "EVENT" as const,
  },
  {
    key: "pesquisa",
    slug: "pesquisa",
    name: "Pesquisa",
    description: "Concedida a quem conduziu uma investigação com método, registro e análise de dados.",
    icon: "microscope",
    type: "ACADEMIC" as const,
  },
  {
    key: "inovacao",
    slug: "inovacao",
    name: "Inovação",
    description: "Concedida a soluções que propõem um caminho novo para um problema conhecido da comunidade.",
    icon: "lightbulb",
    type: "SPECIAL" as const,
  },
];

const USER_BADGES = [
  { userKey: "joao", badgeKey: "destaque", projectKey: "enchentes", eventKey: "hackathon" },
  { userKey: "joao", badgeKey: "hackathon", projectKey: null, eventKey: "hackathon" },
  { userKey: "maria", badgeKey: "hackathon", projectKey: null, eventKey: "hackathon" },
  { userKey: "ana", badgeKey: "feira", projectKey: null, eventKey: "feira" },
  { userKey: "ana", badgeKey: "pesquisa", projectKey: "horta", eventKey: "feira" },
];

const CERTIFICATES = [
  {
    code: "TRJ-2026-JOAOHACK",
    title: "Participação no Hackathon Experimenta 2026",
    studentKey: "joao",
    eventKey: "hackathon",
    projectKey: "enchentes",
    hours: 16,
    issuedAt: new Date("2026-04-16T13:00:00.000Z"),
  },
  {
    code: "TRJ-2026-ANAFEIRA",
    title: "Participação na Feira de Ciências da Escola 2026",
    studentKey: "ana",
    eventKey: "feira",
    projectKey: "horta",
    hours: 12,
    issuedAt: new Date("2026-10-21T13:00:00.000Z"),
  },
];

type SeedNotification = {
  userKey: string;
  type: NotificationType;
  title: string;
  body: string;
  projectKey?: string;
  link?: string;
  readAt: Date | null;
  createdAt: Date;
};

const NOTIFICATIONS: SeedNotification[] = [
  {
    userKey: "joao",
    type: "PROJECT_APPROVED",
    title: "Seu projeto foi aprovado.",
    body: "Sistema de Monitoramento de Enchentes",
    projectKey: "enchentes",
    readAt: new Date("2026-04-15T18:00:00.000Z"),
    createdAt: new Date("2026-04-15T10:15:00.000Z"),
  },
  {
    userKey: "joao",
    type: "BADGE_GRANTED",
    title: "Você recebeu a badge Projeto Destaque.",
    body: "Sistema de Monitoramento de Enchentes",
    link: "/u/joao.silva",
    readAt: null,
    createdAt: new Date("2026-04-15T10:20:00.000Z"),
  },
  {
    userKey: "joao",
    type: "PROJECT_CHANGES_REQUESTED",
    title: "O professor pediu uma alteração.",
    body: "Dashboard de Indicadores Escolares",
    projectKey: "dashboard",
    readAt: null,
    createdAt: new Date("2026-06-22T09:30:00.000Z"),
  },
  {
    userKey: "maria",
    type: "MEMBER_ADDED",
    title: "Você foi adicionado ao projeto Sistema de Monitoramento de Enchentes.",
    body: "João Silva adicionou você à equipe.",
    projectKey: "enchentes",
    readAt: null,
    createdAt: new Date("2026-04-10T15:10:00.000Z"),
  },
  {
    userKey: "teacher",
    type: "PROJECT_SUBMITTED",
    title: "Um projeto foi enviado para validação.",
    body: "Mapa de Acessibilidade Urbana",
    projectKey: "acessibilidade",
    readAt: null,
    createdAt: new Date("2026-10-19T11:20:00.000Z"),
  },
];

async function main() {
  const schoolData = {
    name: "E.E. Conselheiro Crispiniano",
    description:
      "Escola estadual em Guarulhos, com curso técnico em Desenvolvimento de Sistemas. Aqui ficam registrados os projetos construídos pelos estudantes ao longo dos anos.",
    city: "Guarulhos",
    state: "SP",
  };

  const currentSchool = await prisma.school.findUnique({
    where: { slug: SCHOOL_SLUG },
    select: { id: true },
  });
  const legacySchool = currentSchool
    ? null
    : await prisma.school.findUnique({ where: { slug: LEGACY_SCHOOL_SLUG }, select: { id: true } });

  const school = legacySchool
    ? await prisma.school.update({
        where: { id: legacySchool.id },
        data: { slug: SCHOOL_SLUG, ...schoolData },
      })
    : await prisma.school.upsert({
        where: { slug: SCHOOL_SLUG },
        update: schoolData,
        create: { slug: SCHOOL_SLUG, ...schoolData },
      });

  const classroomIds = new Map<string, string>();
  for (const classroom of CLASSROOMS) {
    const current = await prisma.classroom.findUnique({
      where: {
        schoolId_name_year: { schoolId: school.id, name: classroom.name, year: classroom.year },
      },
      select: { id: true },
    });
    const legacy = current
      ? null
      : await prisma.classroom.findUnique({
          where: {
            schoolId_name_year: {
              schoolId: school.id,
              name: classroom.legacyName,
              year: classroom.year,
            },
          },
          select: { id: true },
        });

    const row = current
      ? current
      : legacy
        ? await prisma.classroom.update({ where: { id: legacy.id }, data: { name: classroom.name } })
        : await prisma.classroom.create({
            data: { schoolId: school.id, name: classroom.name, year: classroom.year },
          });

    classroomIds.set(classroom.key, row.id);
  }

  const passwordHash = await hash(DEMO_PASSWORD, 12);
  const userIds = new Map<string, string>();

  for (const seedUser of SEED_USERS) {
    const common = {
      username: seedUser.username,
      name: seedUser.name,
      role: seedUser.role,
      schoolId: school.id,
      bio: seedUser.bio,
      passwordHash,
      profileVisibility: seedUser.profileVisibility,
      mustCompleteOnboarding: false,
      isActive: true,
    };

    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: common,
      create: { email: seedUser.email, ...common },
    });

    userIds.set(seedUser.key, user.id);

    if (seedUser.student) {
      const classroomId = classroomIds.get(seedUser.student.classroomKey) ?? null;
      const profile = {
        course: seedUser.student.course,
        gradeYear: seedUser.student.gradeYear,
        classroomId,
        interests: seedUser.student.interests,
      };
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: profile,
        create: { userId: user.id, ...profile },
      });
    }

    if (seedUser.teacher) {
      await prisma.teacherProfile.upsert({
        where: { userId: user.id },
        update: seedUser.teacher,
        create: { userId: user.id, ...seedUser.teacher },
      });
    }
  }

  const teacherId = userIds.get("teacher")!;

  for (const classroomId of classroomIds.values()) {
    await prisma.classroomTeacher.upsert({
      where: { classroomId_teacherId: { classroomId, teacherId } },
      update: {},
      create: { classroomId, teacherId },
    });
  }

  await seedDefaultSkills(prisma, school.id);
  const skills = await prisma.skill.findMany({
    where: { schoolId: school.id },
    select: { id: true, name: true },
  });
  const skillIds = new Map(skills.map((skill) => [skill.name, skill.id]));

  const eventIds = new Map<string, string>();
  for (const event of EVENTS) {
    const data = {
      name: event.name,
      description: event.description,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      coverImageUrl: event.coverImageUrl,
      schoolId: school.id,
      createdById: teacherId,
    };
    const current = await prisma.event.findUnique({
      where: { slug: event.slug },
      select: { id: true },
    });
    const legacy =
      current || !event.legacySlug
        ? null
        : await prisma.event.findUnique({ where: { slug: event.legacySlug }, select: { id: true } });

    const row = legacy
      ? await prisma.event.update({ where: { id: legacy.id }, data: { slug: event.slug, ...data } })
      : await prisma.event.upsert({
          where: { slug: event.slug },
          update: data,
          create: { slug: event.slug, ...data },
        });

    eventIds.set(event.key, row.id);
  }

  const projectIds = new Map<string, string>();

  for (const seedProject of PROJECTS) {
    const ownerKey = seedProject.members.find((member) => member.isOwner)?.userKey;
    const createdById = userIds.get(ownerKey ?? "joao")!;
    const data = {
      title: seedProject.title,
      summary: seedProject.summary,
      description: seedProject.description,
      problem: seedProject.problem,
      solution: seedProject.solution,
      learnings: seedProject.learnings,
      area: seedProject.area,
      status: seedProject.status,
      visibility: seedProject.visibility,
      isFeatured: seedProject.isFeatured,
      allowFork: seedProject.allowFork,
      coverImageUrl: seedProject.coverImageUrl,
      projectDate: seedProject.projectDate,
      year: seedProject.projectDate.getUTCFullYear(),
      schoolId: school.id,
      createdById,
      advisorId: seedProject.advisorKey ? userIds.get(seedProject.advisorKey)! : null,
      submittedAt: seedProject.submittedAt,
      validatedById: seedProject.validatedAt ? teacherId : null,
      validatedAt: seedProject.validatedAt,
    };

    const project = await prisma.project.upsert({
      where: { slug: seedProject.slug },
      update: data,
      create: { slug: seedProject.slug, ...data },
    });

    projectIds.set(seedProject.key, project.id);

    for (const member of seedProject.members) {
      const userId = userIds.get(member.userKey)!;
      const memberData = {
        role: member.role,
        contribution: member.contribution,
        isOwner: member.isOwner ?? false,
      };
      await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: project.id, userId } },
        update: memberData,
        create: { projectId: project.id, userId, ...memberData },
      });
    }

    await prisma.projectEvidence.deleteMany({ where: { projectId: project.id } });
    await prisma.projectEvidence.createMany({
      data: seedProject.evidences.map((evidence, index) => ({
        projectId: project.id,
        type: evidence.type,
        title: evidence.title,
        description: evidence.description,
        url: evidence.url,
        order: index,
      })),
    });

    for (const skill of seedProject.skills) {
      const skillId = skillIds.get(skill.name);
      if (!skillId) throw new Error(`Competência não encontrada no catálogo: ${skill.name}`);

      const skillData = skill.verified
        ? {
            suggestedByStudent: true,
            validatedByTeacher: true,
            validatorId: teacherId,
            validatedAt: seedProject.validatedAt ?? new Date("2026-04-15T10:15:00.000Z"),
          }
        : {
            suggestedByStudent: true,
            validatedByTeacher: false,
            validatorId: null,
            validatedAt: null,
          };

      await prisma.projectSkill.upsert({
        where: { projectId_skillId: { projectId: project.id, skillId } },
        update: skillData,
        create: { projectId: project.id, skillId, ...skillData },
      });
    }

    await prisma.eventProject.deleteMany({ where: { projectId: project.id } });
    if (seedProject.eventKey) {
      await prisma.eventProject.create({
        data: {
          projectId: project.id,
          eventId: eventIds.get(seedProject.eventKey)!,
          isHighlight: seedProject.isHighlight ?? false,
        },
      });
    }
  }

  const projectIdList = [...projectIds.values()];
  await prisma.projectValidation.deleteMany({ where: { projectId: { in: projectIdList } } });

  await prisma.projectValidation.create({
    data: {
      projectId: projectIds.get("enchentes")!,
      reviewerId: teacherId,
      action: "APPROVED",
      strengths:
        "A equipe conversou com moradores antes de definir o alerta e isso aparece no resultado. A divisão de trabalho ficou clara e cada integrante sabia explicar a parte do outro.",
      improvements:
        "Documentem no repositório como reproduzir a montagem do sensor. Sem isso, a próxima turma vai precisar descobrir tudo de novo.",
      generalComment:
        "Projeto maduro para o tempo que vocês tiveram. Vale continuar o contato com a defesa civil no segundo semestre.",
      createdAt: new Date("2026-04-15T10:15:00.000Z"),
    },
  });

  await prisma.projectValidation.create({
    data: {
      projectId: projectIds.get("horta")!,
      reviewerId: teacherId,
      action: "APPROVED",
      strengths:
        "A calibração dos sensores foi feita com método e o relatório mostra a comparação antes e depois com honestidade.",
      improvements:
        "Na próxima medição, registrem também a temperatura do dia. Isso ajuda a explicar as variações que ficaram sem resposta.",
      generalComment: "Bom trabalho de investigação. O estande explicou o circuito de forma acessível.",
      createdAt: new Date("2026-10-20T16:40:00.000Z"),
    },
  });

  await prisma.projectValidation.create({
    data: {
      projectId: projectIds.get("dashboard")!,
      reviewerId: teacherId,
      action: "CHANGES_REQUESTED",
      comment: "Adicione uma explicação melhor sobre sua participação individual.",
      strengths: "As consultas estão bem escritas e o painel responde à pergunta que a coordenação fez.",
      improvements:
        "Descreva na sua contribuição o que você fez sozinho e o que veio pronto da secretaria. Do jeito que está, não dá para separar.",
      createdAt: new Date("2026-06-22T09:30:00.000Z"),
    },
  });

  const badgeIds = new Map<string, string>();
  for (const badge of BADGES) {
    const data = {
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      type: badge.type,
    };
    const row = await prisma.badge.upsert({
      where: { schoolId_slug: { schoolId: school.id, slug: badge.slug } },
      update: data,
      create: { schoolId: school.id, slug: badge.slug, ...data },
    });
    badgeIds.set(badge.key, row.id);
  }

  for (const userBadge of USER_BADGES) {
    const userId = userIds.get(userBadge.userKey)!;
    const badgeId = badgeIds.get(userBadge.badgeKey)!;
    const projectId = userBadge.projectKey ? projectIds.get(userBadge.projectKey)! : null;

    const existing = await prisma.userBadge.findFirst({
      where: { userId, badgeId, projectId },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
        projectId,
        eventId: userBadge.eventKey ? eventIds.get(userBadge.eventKey)! : null,
        issuedById: teacherId,
      },
    });
  }

  for (const certificate of CERTIFICATES) {
    const data = {
      title: certificate.title,
      studentId: userIds.get(certificate.studentKey)!,
      schoolId: school.id,
      eventId: eventIds.get(certificate.eventKey)!,
      projectId: projectIds.get(certificate.projectKey)!,
      hours: certificate.hours,
      issuedById: teacherId,
      issuedAt: certificate.issuedAt,
      revokedAt: null,
    };
    await prisma.certificate.upsert({
      where: { code: certificate.code },
      update: data,
      create: { code: certificate.code, ...data },
    });
  }

  const seededUserIds = [...userIds.values()];
  await prisma.notification.deleteMany({ where: { userId: { in: seededUserIds } } });
  await prisma.notification.createMany({
    data: NOTIFICATIONS.map((notification) => {
      const projectSlug = notification.projectKey
        ? PROJECTS.find((project) => project.key === notification.projectKey)?.slug
        : undefined;
      return {
        userId: userIds.get(notification.userKey)!,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        link: notification.link ?? (projectSlug ? `/projects/${projectSlug}` : null),
        readAt: notification.readAt,
        createdAt: notification.createdAt,
      };
    }),
  });

  await prisma.auditLog.deleteMany({ where: { schoolId: school.id } });
  await prisma.auditLog.createMany({
    data: [
      {
        schoolId: school.id,
        actorId: teacherId,
        action: "project.approved",
        entityType: "Project",
        entityId: projectIds.get("enchentes")!,
        metadata: { validatedSkills: 4 },
        createdAt: new Date("2026-04-15T10:15:00.000Z"),
      },
      {
        schoolId: school.id,
        actorId: teacherId,
        action: "badge.granted",
        entityType: "UserBadge",
        entityId: projectIds.get("enchentes")!,
        metadata: { badge: "Projeto Destaque", student: "joao.silva" },
        createdAt: new Date("2026-04-15T10:20:00.000Z"),
      },
      {
        schoolId: school.id,
        actorId: teacherId,
        action: "project.changes_requested",
        entityType: "Project",
        entityId: projectIds.get("dashboard")!,
        createdAt: new Date("2026-06-22T09:30:00.000Z"),
      },
    ],
  });

  const counts = {
    escola: school.name,
    usuarios: await prisma.user.count({ where: { schoolId: school.id } }),
    turmas: await prisma.classroom.count({ where: { schoolId: school.id } }),
    competencias: await prisma.skill.count({ where: { schoolId: school.id } }),
    eventos: await prisma.event.count({ where: { schoolId: school.id } }),
    projetos: await prisma.project.count({ where: { schoolId: school.id } }),
    badges: await prisma.badge.count({ where: { schoolId: school.id } }),
    badgesConcedidas: await prisma.userBadge.count({ where: { badge: { schoolId: school.id } } }),
    certificados: await prisma.certificate.count({ where: { schoolId: school.id } }),
    notificacoes: await prisma.notification.count({ where: { user: { schoolId: school.id } } }),
  };

  console.table(counts);
  console.log(`Senha de demonstração: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
