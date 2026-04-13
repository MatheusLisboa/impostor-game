import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, serverTimestamp, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { generateInitialThemes } from './gemini';

export interface Word {
  palavra: string;
  dica: string;
}

export interface Theme {
  id?: string;
  name: string;
  words: (string | Word)[];
  category: string;
  updated_at: any;
  is_custom?: boolean;
  created_by?: string;
}

export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage first for offline support
    const cached = localStorage.getItem('impostor_themes');
    if (cached) {
      setThemes(JSON.parse(cached));
      setLoading(false);
    }

    const q = query(collection(db, 'temas'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const themesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Theme[];
      
      setThemes(themesData);
      localStorage.setItem('impostor_themes', JSON.stringify(themesData));
      setLoading(false);

      // Seed if empty
      if (themesData.length === 0 && !loading) {
        seedInitialData();
      }
    });

    return () => unsubscribe();
  }, []);

  const seedInitialData = async () => {
    try {
      console.log('Checking/Seeding initial data...');
      
      const providedThemes = [
        {
          "name": "Animais",
          "category": "Geral",
          "words": [
            {"palavra":"Leão","dica":"Selva"}, {"palavra":"Tigre","dica":"Listras"}, {"palavra":"Elefante","dica":"Grande"},
            {"palavra":"Girafa","dica":"Alta"}, {"palavra":"Zebra","dica":"Listras"}, {"palavra":"Cavalo","dica":"Corrida"},
            {"palavra":"Vaca","dica":"Leite"}, {"palavra":"Porco","dica":"Fazenda"}, {"palavra":"Cachorro","dica":"Pet"},
            {"palavra":"Gato","dica":"Felino"}, {"palavra":"Coelho","dica":"Rápido"}, {"palavra":"Urso","dica":"Frio"},
            {"palavra":"Lobo","dica":"Matilha"}, {"palavra":"Raposa","dica":"Astuta"}, {"palavra":"Macaco","dica":"Árvore"},
            {"palavra":"Gorila","dica":"Forte"}, {"palavra":"Chimpanzé","dica":"Inteligente"}, {"palavra":"Canguru","dica":"Salto"},
            {"palavra":"Panda","dica":"Bambu"}, {"palavra":"Camelo","dica":"Deserto"}, {"palavra":"Cobra","dica":"Veneno"},
            {"palavra":"Jacaré","dica":"Rio"}, {"palavra":"Crocodilo","dica":"Água"}, {"palavra":"Tubarão","dica":"Mar"},
            {"palavra":"Baleia","dica":"Gigante"}, {"palavra":"Golfinho","dica":"Inteligente"}, {"palavra":"Polvo","dica":"Tentáculos"},
            {"palavra":"Lula","dica":"Tinta"}, {"palavra":"Caranguejo","dica":"Praia"}, {"palavra":"Lagosta","dica":"Mar"},
            {"palavra":"Águia","dica":"Céu"}, {"palavra":"Falcão","dica":"Caça"}, {"palavra":"Coruja","dica":"Noite"},
            {"palavra":"Galinha","dica":"Ovo"}, {"palavra":"Galo","dica":"Manhã"}, {"palavra":"Pato","dica":"Lago"},
            {"palavra":"Cisne","dica":"Elegante"}, {"palavra":"Pinguim","dica":"Gelo"}, {"palavra":"Avestruz","dica":"Corrida"},
            {"palavra":"Papagaio","dica":"Fala"}, {"palavra":"Canário","dica":"Canto"}, {"palavra":"Beija-flor","dica":"Néctar"},
            {"palavra":"Borboleta","dica":"Asas"}, {"palavra":"Abelha","dica":"Mel"}, {"palavra":"Formiga","dica":"Trabalho"},
            {"palavra":"Mosquito","dica":"Picada"}, {"palavra":"Mosca","dica":"Sujeira"}, {"palavra":"Aranha","dica":"Teia"},
            {"palavra":"Escorpião","dica":"Ferrão"}, {"palavra":"Besouro","dica":"Casca"}, {"palavra":"Rato","dica":"Esgoto"},
            {"palavra":"Morcego","dica":"Noite"}, {"palavra":"Tartaruga","dica":"Lento"}, {"palavra":"Sapo","dica":"Pulo"},
            {"palavra":"Rã","dica":"Lago"}, {"palavra":"Lagarto","dica":"Sol"}, {"palavra":"Iguana","dica":"Verde"},
            {"palavra":"Alce","dica":"Chifre"}, {"palavra":"Veado","dica":"Floresta"}, {"palavra":"Búfalo","dica":"Campo"},
            {"palavra":"Anta","dica":"Brasil"}, {"palavra":"Doninha","dica":"Pequeno"}, {"palavra":"Texugo","dica":"Terra"},
            {"palavra":"Hiena","dica":"Riso"}, {"palavra":"Leopardo","dica":"Manchas"}, {"palavra":"Pantera","dica":"Escuro"},
            {"palavra":"Coiote","dica":"Deserto"}, {"palavra":"Guaxinim","dica":"Máscara"}, {"palavra":"Furão","dica":"Cheiro"},
            {"palavra":"Caracol","dica":"Lento"}, {"palavra":"Minhoca","dica":"Terra"}, {"palavra":"Centopeia","dica":"Patas"},
            {"palavra":"Libélula","dica":"Voa"}, {"palavra":"Gafanhoto","dica":"Salto"}, {"palavra":"Grilo","dica":"Som"},
            {"palavra":"Perereca","dica":"Árvore"}, {"palavra":"Texugo","dica":"Toca"}, {"palavra":"Suricato","dica":"Alerta"},
            {"palavra":"Okapi","dica":"Raro"}, {"palavra":"Narval","dica":"Chifre"}, {"palavra":"Foca","dica":"Gelo"},
            {"palavra":"Morsa","dica":"Presas"}, {"palavra":"Doninha","dica":"Ágil"}, {"palavra":"Galo","dica":"Canto"},
            {"palavra":"Peru","dica":"Festa"}, {"palavra":"Codorna","dica":"Ovo"}, {"palavra":"Corvo","dica":"Preto"},
            {"palavra":"Pombo","dica":"Cidade"}, {"palavra":"Gaivota","dica":"Praia"}, {"palavra":"Andorinha","dica":"Migra"},
            {"palavra":"Tucano","dica":"Bico"}, {"palavra":"Arara","dica":"Colorido"}, {"palavra":"Siri","dica":"Mar"},
            {"palavra":"Camarão","dica":"Pequeno"}
          ]
        },
        {
          "name": "Bíblia",
          "category": "Religião",
          "words": [
            {"palavra":"Jesus","dica":"Salvador"}, {"palavra":"Deus","dica":"Criador"}, {"palavra":"Moisés","dica":"Êxodo"},
            {"palavra":"Abraão","dica":"Fé"}, {"palavra":"Noé","dica":"Arca"}, {"palavra":"Davi","dica":"Rei"},
            {"palavra":"Golias","dica":"Gigante"}, {"palavra":"Adão","dica":"Primeiro"}, {"palavra":"Eva","dica":"Mulher"},
            {"palavra":"José","dica":"Sonhos"}, {"palavra":"Daniel","dica":"Leões"}, {"palavra":"Jonas","dica":"Peixe"},
            {"palavra":"Pedro","dica":"Apóstolo"}, {"palavra":"Paulo","dica":"Cartas"}, {"palavra":"Maria","dica":"Mãe"},
            {"palavra":"Elias","dica":"Profeta"}, {"palavra":"Eliseu","dica":"Milagre"}, {"palavra":"Sansão","dica":"Força"},
            {"palavra":"Salomão","dica":"Sabedoria"}, {"palavra":"Jeremias","dica":"Choro"}, {"palavra":"Isaías","dica":"Profecia"},
            {"palavra":"Ezequiel","dica":"Visão"}, {"palavra":"Apocalipse","dica":"Fim"}, {"palavra":"Gênesis","dica":"Início"},
            {"palavra":"Êxodo","dica":"Saída"}, {"palavra":"Levítico","dica":"Lei"}, {"palavra":"Números","dica":"Contagem"},
            {"palavra":"Deuteronômio","dica":"Repetição"}, {"palavra":"Josué","dica":"Conquista"}, {"palavra":"Juízes","dica":"Líderes"},
            {"palavra":"Rute","dica":"Lealdade"}, {"palavra":"Ester","dica":"Rainha"}, {"palavra":"Jó","dica":"Prova"},
            {"palavra":"Salmos","dica":"Louvor"}, {"palavra":"Provérbios","dica":"Sabedoria"}, {"palavra":"Eclesiastes","dica":"Vaidade"},
            {"palavra":"Cantares","dica":"Amor"}, {"palavra":"Mateus","dica":"Evangelho"}, {"palavra":"Marcos","dica":"Evangelho"},
            {"palavra":"Lucas","dica":"Evangelho"}, {"palavra":"João","dica":"Amor"}, {"palavra":"Atos","dica":"Igreja"},
            {"palavra":"Romanos","dica":"Doutrina"}, {"palavra":"Coríntios","dica":"Carta"}, {"palavra":"Gálatas","dica":"Graça"},
            {"palavra":"Efésios","dica":"Unidade"}, {"palavra":"Filipenses","dica":"Alegria"}, {"palavra":"Colossenses","dica":"Cristo"},
            {"palavra":"Tessalonicenses","dica":"Vinda"}, {"palavra":"Timóteo","dica":"Jovem"}, {"palavra":"Tito","dica":"Líder"},
            {"palavra":"Filemom","dica":"Perdão"}, {"palavra":"Hebreus","dica":"Fé"}, {"palavra":"Tiago","dica":"Obras"},
            {"palavra":"Pedro","dica":"Rocha"}, {"palavra":"João","dica":"Discípulo"}, {"palavra":"Judas","dica":"Traição"},
            {"palavra":"Cruz","dica":"Sacrifício"}, {"palavra":"Pecado","dica":"Erro"}, {"palavra":"Oração","dica":"Falar"},
            {"palavra":"Milagre","dica":"Poder"}, {"palavra":"Anjo","dica":"Céu"}, {"palavra":"Demônio","dica":"Mal"},
            {"palavra":"Céu","dica":"Glória"}, {"palavra":"Inferno","dica":"Fogo"}, {"palavra":"Graça","dica":"Favor"},
            {"palavra":"Fé","dica":"Crer"}, {"palavra":"Amor","dica":"Ágape"}, {"palavra":"Paz","dica":"Calma"},
            {"palavra":"Alegria","dica":"Felicidade"}, {"palavra":"Perdão","dica":"Libertar"}, {"palavra":"Batismo","dica":"Água"},
            {"palavra":"Comunhão","dica":"União"}, {"palavra":"Evangelho","dica":"Notícia"}, {"palavra":"Discípulo","dica":"Seguir"},
            {"palavra":"Apóstolo","dica":"Enviado"}, {"palavra":"Profeta","dica":"Mensagem"}, {"palavra":"Reino","dica":"Governo"},
            {"palavra":"Templo","dica":"Casa"}, {"palavra":"Altar","dica":"Oferta"}, {"palavra":"Sacrifício","dica":"Entrega"},
            {"palavra":"Aliança","dica":"Pacto"}, {"palavra":"Mandamento","dica":"Regra"}, {"palavra":"Lei","dica":"Ordem"},
            {"palavra":"Páscoa","dica":"Libertação"}, {"palavra":"Pentecostes","dica":"Espírito"}
          ]
        },
        {
          "name": "Comidas",
          "category": "Geral",
          "words": [
            {"palavra":"Pizza","dica":"Forno"}, {"palavra":"Hambúrguer","dica":"Lanche"}, {"palavra":"Hotdog","dica":"Rua"},
            {"palavra":"Sushi","dica":"Japão"}, {"palavra":"Feijoada","dica":"Brasil"}, {"palavra":"Macarrão","dica":"Massa"},
            {"palavra":"Lasanha","dica":"Camadas"}, {"palavra":"Arroz","dica":"Grão"}, {"palavra":"Feijão","dica":"Caldo"},
            {"palavra":"Carne","dica":"Proteína"}, {"palavra":"Frango","dica":"Assado"}, {"palavra":"Peixe","dica":"Mar"},
            {"palavra":"Salada","dica":"Verde"}, {"palavra":"Batata","dica":"Frita"}, {"palavra":"Purê","dica":"Creme"},
            {"palavra":"Ovo","dica":"Cozido"}, {"palavra":"Bolo","dica":"Doce"}, {"palavra":"Torta","dica":"Recheio"},
            {"palavra":"Sorvete","dica":"Frio"}, {"palavra":"Chocolate","dica":"Doce"},
            {"palavra":"Pão","dica":"Padaria"}, {"palavra":"Queijo","dica":"Leite"}, {"palavra":"Presunto","dica":"Frio"},
            {"palavra":"Manteiga","dica":"Pão"}, {"palavra":"Geléia","dica":"Fruta"}, {"palavra":"Mel","dica":"Abelha"},
            {"palavra":"Iogurte","dica":"Leite"}, {"palavra":"Cereal","dica":"Café"}, {"palavra":"Café","dica":"Xícara"},
            {"palavra":"Chá","dica":"Quente"}, {"palavra":"Suco","dica":"Fruta"}, {"palavra":"Refrigerante","dica":"Gás"},
            {"palavra":"Vinho","dica":"Uva"}, {"palavra":"Cerveja","dica":"Cevada"}, {"palavra":"Água","dica":"Sede"},
            {"palavra":"Biscoito","dica":"Crocante"}, {"palavra":"Bolacha","dica":"Recheio"}, {"palavra":"Pipoca","dica":"Cinema"},
            {"palavra":"Amendoim","dica":"Casca"}, {"palavra":"Castanha","dica":"Árvore"}, {"palavra":"Fruta","dica":"Pomar"},
            {"palavra":"Maçã","dica":"Vermelha"}, {"palavra":"Banana","dica":"Amarela"}, {"palavra":"Laranja","dica":"Suco"},
            {"palavra":"Morango","dica":"Vermelho"}, {"palavra":"Uva","dica":"Cacho"}, {"palavra":"Melancia","dica":"Grande"},
            {"palavra":"Abacaxi","dica":"Coroa"}, {"palavra":"Limão","dica":"Azedo"}, {"palavra":"Manga","dica":"Caroço"}
          ]
        },
        {
          "name": "Profissões",
          "category": "Geral",
          "words": [
            {"palavra":"Médico","dica":"Hospital"}, {"palavra":"Professor","dica":"Escola"}, {"palavra":"Policial","dica":"Lei"},
            {"palavra":"Bombeiro","dica":"Fogo"}, {"palavra":"Advogado","dica":"Justiça"}, {"palavra":"Engenheiro","dica":"Obra"},
            {"palavra":"Dentista","dica":"Dente"}, {"palavra":"Cozinheiro","dica":"Cozinha"}, {"palavra":"Motorista","dica":"Carro"},
            {"palavra":"Piloto","dica":"Avião"}, {"palavra":"Programador","dica":"Código"}, {"palavra":"Designer","dica":"Arte"},
            {"palavra":"Fotógrafo","dica":"Câmera"}, {"palavra":"Ator","dica":"Filme"}, {"palavra":"Cantor","dica":"Música"},
            {"palavra":"Pastor","dica":"Igreja"}, {"palavra":"Enfermeiro","dica":"Cuidado"}, {"palavra":"Garçom","dica":"Servir"},
            {"palavra":"Mecânico","dica":"Oficina"}, {"palavra":"Arquiteto","dica":"Projeto"},
            {"palavra":"Veterinário","dica":"Animal"}, {"palavra":"Psicólogo","dica":"Mente"}, {"palavra":"Jornalista","dica":"Notícia"},
            {"palavra":"Cientista","dica":"Laboratório"}, {"palavra":"Astrônomo","dica":"Espaço"}, {"palavra":"Biólogo","dica":"Vida"},
            {"palavra":"Químico","dica":"Reação"}, {"palavra":"Físico","dica":"Matéria"}, {"palavra":"Matemático","dica":"Número"},
            {"palavra":"Historiador","dica":"Passado"}, {"palavra":"Geógrafo","dica":"Mapa"}, {"palavra":"Sociólogo","dica":"Sociedade"},
            {"palavra":"Filósofo","dica":"Pensar"}, {"palavra":"Político","dica":"Voto"}, {"palavra":"Juiz","dica":"Tribunal"},
            {"palavra":"Promotor","dica":"Acusação"}, {"palavra":"Delegado","dica":"Delegacia"}, {"palavra":"Detetive","dica":"Lupa"},
            {"palavra":"Espião","dica":"Segredo"}, {"palavra":"Soldado","dica":"Guerra"}, {"palavra":"Marinheiro","dica":"Navio"},
            {"palavra":"Aviador","dica":"Céu"}, {"palavra":"Astronauta","dica":"Foguete"}, {"palavra":"Atleta","dica":"Esporte"},
            {"palavra":"Jogador","dica":"Campo"}, {"palavra":"Treinador","dica":"Time"}, {"palavra":"Árbitro","dica":"Apito"},
            {"palavra":"Modelo","dica":"Passarela"}, {"palavra":"Estilista","dica":"Moda"}, {"palavra":"Padeiro","dica":"Pão"}
          ]
        },
        {
          "name": "Lugares",
          "category": "Geral",
          "words": [
            {"palavra":"Praia","dica":"Areia"}, {"palavra":"Cinema","dica":"Filme"}, {"palavra":"Escola","dica":"Aula"},
            {"palavra":"Hospital","dica":"Doença"}, {"palavra":"Igreja","dica":"Fé"}, {"palavra":"Shopping","dica":"Loja"},
            {"palavra":"Parque","dica":"Verde"}, {"palavra":"Aeroporto","dica":"Viagem"}, {"palavra":"Restaurante","dica":"Comida"},
            {"palavra":"Academia","dica":"Treino"}, {"palavra":"Biblioteca","dica":"Livro"}, {"palavra":"Estádio","dica":"Jogo"},
            {"palavra":"Teatro","dica":"Peça"}, {"palavra":"Farmácia","dica":"Remédio"}, {"palavra":"Supermercado","dica":"Compras"},
            {"palavra":"Padaria","dica":"Pão"}, {"palavra":"Posto","dica":"Gasolina"}, {"palavra":"Banco","dica":"Dinheiro"},
            {"palavra":"Hotel","dica":"Hospedar"}, {"palavra":"Rodoviária","dica":"Ônibus"},
            {"palavra":"Museu","dica":"Arte"}, {"palavra":"Zoológico","dica":"Animal"}, {"palavra":"Aquário","dica":"Peixe"},
            {"palavra":"Planetário","dica":"Estrela"}, {"palavra":"Observatório","dica":"Telescópio"}, {"palavra":"Castelo","dica":"Rei"},
            {"palavra":"Palácio","dica":"Rainha"}, {"palavra":"Monumento","dica":"História"}, {"palavra":"Praça","dica":"Banco"},
            {"palavra":"Avenida","dica":"Carro"}, {"palavra":"Rua","dica":"Calçada"}, {"palavra":"Beco","dica":"Estreito"},
            {"palavra":"Ponte","dica":"Rio"}, {"palavra":"Túnel","dica":"Escuro"}, {"palavra":"Viaduto","dica":"Alto"},
            {"palavra":"Porto","dica":"Navio"}, {"palavra":"Estação","dica":"Trem"}, {"palavra":"Metrô","dica":"Trilho"},
            {"palavra":"Ponto","dica":"Espera"}, {"palavra":"Parada","dica":"Ônibus"}, {"palavra":"Abrigo","dica":"Proteção"},
            {"palavra":"Refúgio","dica":"Paz"}, {"palavra":"Cabana","dica":"Madeira"}, {"palavra":"Chalé","dica":"Montanha"},
            {"palavra":"Mansão","dica":"Luxo"}, {"palavra":"Prédio","dica":"Andar"}, {"palavra":"Casa","dica":"Lar"},
            {"palavra":"Apartamento","dica":"Bloco"}, {"palavra":"Vila","dica":"Casas"}, {"palavra":"Fazenda","dica":"Campo"}
          ]
        },
        {
          "name": "Tecnologia",
          "category": "Geral",
          "words": [
            {"palavra":"Celular","dica":"App"}, {"palavra":"Computador","dica":"Tela"}, {"palavra":"Internet","dica":"Rede"},
            {"palavra":"WiFi","dica":"Sinal"}, {"palavra":"Teclado","dica":"Digitar"}, {"palavra":"Mouse","dica":"Clique"},
            {"palavra":"Monitor","dica":"Imagem"}, {"palavra":"Impressora","dica":"Papel"}, {"palavra":"Notebook","dica":"Portátil"},
            {"palavra":"Software","dica":"Sistema"}, {"palavra":"Hardware","dica":"Peça"}, {"palavra":"Servidor","dica":"Dados"},
            {"palavra":"Cloud","dica":"Nuvem"}, {"palavra":"Banco","dica":"Dados"}, {"palavra":"API","dica":"Integração"},
            {"palavra":"Código","dica":"Lógica"}, {"palavra":"Bug","dica":"Erro"}, {"palavra":"App","dica":"Mobile"},
            {"palavra":"Site","dica":"Web"}, {"palavra":"Login","dica":"Acesso"},
            {"palavra":"Tablet","dica":"Touch"}, {"palavra":"Smartwatch","dica":"Pulso"}, {"palavra":"Câmera","dica":"Foto"},
            {"palavra":"Drone","dica":"Voar"}, {"palavra":"Robô","dica":"Metal"}, {"palavra":"Sensor","dica":"Detectar"},
            {"palavra":"Chip","dica":"Silício"}, {"palavra":"Processador","dica":"Cérebro"}, {"palavra":"Memória","dica":"RAM"},
            {"palavra":"Disco","dica":"HD"}, {"palavra":"Cabo","dica":"Fio"}, {"palavra":"Adaptador","dica":"Conectar"},
            {"palavra":"Carregador","dica":"Energia"}, {"palavra":"Bateria","dica":"Carga"}, {"palavra":"Antena","dica":"Onda"},
            {"palavra":"Roteador","dica":"Sinal"}, {"palavra":"Modem","dica":"Conexão"}, {"palavra":"Switch","dica":"Rede"},
            {"palavra":"Hub","dica":"Portas"}, {"palavra":"Firewall","dica":"Segurança"}, {"palavra":"Proxy","dica":"Intermediário"},
            {"palavra":"VPN","dica":"Privado"}, {"palavra":"Token","dica":"Código"}, {"palavra":"Senha","dica":"Chave"},
            {"palavra":"Biometria","dica":"Corpo"}, {"palavra":"Digital","dica":"Dedo"}, {"palavra":"Facial","dica":"Rosto"},
            {"palavra":"Voz","dica":"Som"}, {"palavra":"Som","dica":"Áudio"}, {"palavra":"Vídeo","dica":"Filme"}
          ]
        }
      ];

      const q = query(collection(db, 'temas'));
      const snapshot = await getDocs(q);
      const existingThemes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Theme }));

      for (const theme of providedThemes) {
        const existing = existingThemes.find(t => t.name === theme.name && !t.is_custom);
        if (existing) {
          // Update existing default theme
          await updateDoc(doc(db, 'temas', existing.id!), {
            ...theme,
            updated_at: serverTimestamp(),
            is_custom: false
          });
        } else {
          // Add new default theme
          await addDoc(collection(db, 'temas'), {
            ...theme,
            updated_at: serverTimestamp(),
            is_custom: false
          });
        }
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  const addCustomTheme = async (theme: Omit<Theme, 'id' | 'updated_at'>) => {
    await addDoc(collection(db, 'temas'), {
      ...theme,
      updated_at: serverTimestamp(),
      is_custom: true
    });
  };

  return { themes, loading, addCustomTheme, seedInitialData };
}
