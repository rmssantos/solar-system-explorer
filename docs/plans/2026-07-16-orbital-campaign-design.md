# Campanha Orbital Fullscreen — Design

## Direção

O mini-jogo passa a ser uma pequena campanha de operações orbitais em papel. A primeira missão continua a ser a entrega e acoplagem na ISS. Ao concluí-la, surge a segunda missão: levar um módulo de manutenção ao Telescópio Espacial Hubble. A fantasia mantém-se educativa e credível, mas continua a exigir controlo da nave, leitura de instrumentos e precisão. Uma terceira missão de calibração do James Webb fica prevista na arquitetura, sem duplicar agora interfaces ou código que ainda não são necessários.

O modal orbital torna-se uma shell de jogo reutilizável. Recebe um perfil de missão com identificador, alvo, dificuldade, textos, resultado e desenho do veículo de destino. A física de aproximação, o teclado e os comandos táteis são partilhados. A ISS usa o corredor e os limites atuais; o Hubble acrescenta deriva suave e uma janela de captura mais exigente. Os contratos deixam de estar codificados diretamente na interface: o diário apresenta os contratos do catálogo, com bloqueio sequencial, aceitação, viagem, início e conclusão persistidos no progresso existente.

## Dispositivos e interface

Em telemóveis, o jogo ocupa `100dvw × 100dvh` e o canvas protege a maior parte da área útil. Título, fechar e telemetria tornam-se pequenos elementos sobrepostos nas margens. Os comandos ficam numa zona dedicada ao polegar, com alvos entre 56 e 64 px sempre que a altura permita. Em retrato, o percurso é desenhado verticalmente — nave em baixo, alvo em cima — para evitar reduzir uma cena horizontal de 16:9 a uma faixa minúscula. Em paisagem, mantém-se a aproximação lateral com comandos à direita. Tablets usam a mesma decisão por proporção e capacidade tátil, com limites maiores. Desktop preserva a folha de papel, teclado WASD/setas, Q/E e Espaço, sem obrigar a interface móvel.

A UI informativa permanece em DOM e o jogo em Phaser Canvas. Mudanças de orientação reconstroem apenas a apresentação, preservando o estado da simulação. `prefers-reduced-motion`, safe areas, 44 px mínimos, foco visível e mensagens bilingues continuam obrigatórios. A validação cobre telefone pequeno e grande, tablet, landscape curto, desktop, toque prolongado, teclado, sucesso, contacto inseguro, reabertura e rotação.
