import { aproveitamentos } from "./dados.js";
import { linhasPosto } from "./linhasPosto.js";

export function organizarInformacoes(programacao){
    var quadroDeHorario = [];
    let vigencia = programacao.dataInicioVigencia.split('T')[0].split('-');
    vigencia = `${vigencia[2]}-${vigencia[1]}-${vigencia[0]}`;
    let postos = [];
    let nomesPosto = [];
    let tabelasAproveitamentos = [];
    let mediaTempoPorPosto = {};
    
    adicionarItemUnico(postos,programacao.quadro.tabelas[0].trechos[0].inicio.codigoPostoControle);
    adicionarItemUnico(nomesPosto,programacao.quadro.tabelas[0].trechos[0].inicio.postoControle);
    
    adicionarItemUnico(postos,programacao.quadro.tabelas[0].trechos[0].fim.codigoPostoControle);
    adicionarItemUnico(nomesPosto,programacao.quadro.tabelas[0].trechos[0].fim.postoControle);
    if(postos,programacao.quadro.tabelas[0].trechos[2]){
        adicionarItemUnico(postos,programacao.quadro.tabelas[0].trechos[2].inicio.codigoPostoControle);
        adicionarItemUnico(nomesPosto,programacao.quadro.tabelas[0].trechos[2].inicio.postoControle);

        adicionarItemUnico(postos,programacao.quadro.tabelas[0].trechos[2].fim.codigoPostoControle);
        adicionarItemUnico(nomesPosto,programacao.quadro.tabelas[0].trechos[2].fim.postoControle);
    }
    


    let tabelas = [];
    for(let tabela of programacao.quadro.tabelas){
        if(tabela.numero>99){
            adicionarItemUnico(tabelasAproveitamentos,tabela.numero);
        }
        let tabelaInfo = {
            tabela: tabela.numero,
            classe: tabela.classe,
            qtdViagens: tabela.qtdViagens,
            kmmMorta: tabela.kmmMorta,
            empresa: tabela.trechos[0].empresa
        }
        tabelas.push(tabelaInfo);
    }
    

      let informacoesLinha = {
        linha: programacao.linha.trim(),
        tipo: programacao.quadro.tipoDia,
        vigencia: vigencia,
        extensaoLinha: programacao.extensaoLinha,
        kmProgramada:programacao.kmProgramada,
        tabelas,
        codigoPostoControle:postos,
        nomesPosto,
        mediaTempoPorPosto
      }

      var [quadroDeHorario,tempoMedio] = organizarQuadroDeHorario(programacao);
      let aproveitamentosLinha = [];
      informacoesLinha.mediaTempoPorPosto = tempoMedio;
      for(let table of tabelasAproveitamentos){
        if(aproveitamentos[table]){
            aproveitamentosLinha.push({tabela: table , aproveitamento: aproveitamentos[table]});

        }
      }

      return [informacoesLinha,quadroDeHorario,aproveitamentosLinha];
}

function adicionarItemUnico(array,chave){
    if(!array.includes(chave)){
        array.push(chave);
    }
}

function organizarQuadroDeHorario(programacao){
    let postos = [];
    let horariosPostos = [];
    for(let tabela=0;tabela<programacao.quadro.tabelas.length;tabela++){
        for(let trecho=0;trecho<programacao.quadro.tabelas[tabela].trechos.length;trecho++){

            adicionaHorarioPostos(horariosPostos,programacao.quadro.tabelas[tabela].trechos[trecho].inicio.postoControle,programacao.quadro.tabelas[tabela].trechos[trecho].inicio.horario.slice(programacao.quadro.tabelas[tabela].trechos[trecho].inicio.horario.indexOf('T')+1,programacao.quadro.tabelas[tabela].trechos[trecho].inicio.horario.length-3),programacao.quadro.tabelas[tabela].trechos[trecho].fim.horario.slice(programacao.quadro.tabelas[tabela].trechos[trecho].fim.horario.indexOf('T')+1,programacao.quadro.tabelas[tabela].trechos[trecho].fim.horario.length-3));

            let voltaLanche = '';
            (trecho>0) ? voltaLanche = programacao.quadro.tabelas[tabela].trechos[trecho-1].fim.descricao.slice(0,1):voltaLanche = programacao.quadro.tabelas[tabela].trechos[trecho].fim.descricao.slice(0,1);
            (programacao.quadro.tabelas[tabela].trechos[trecho].inicio.descricao=="Expresso"||programacao.quadro.tabelas[tabela].trechos[trecho].inicio.descricao=="EntradaExpresso") ? voltaLanche='Ex' : (voltaLanche=='L') ? voltaLanche='VL': voltaLanche='';

            if(!postos[programacao.quadro.tabelas[tabela].trechos[trecho].inicio.postoControle]){
                postos[programacao.quadro.tabelas[tabela].trechos[trecho].inicio.postoControle] = [];
            }
            postos[programacao.quadro.tabelas[tabela].trechos[trecho].inicio.postoControle].push({
                terminalSaida: programacao.quadro.tabelas[tabela].trechos[trecho].inicio.postoControle,
                terminalChegada: programacao.quadro.tabelas[tabela].trechos[trecho].fim.postoControle,
                tabela:programacao.quadro.tabelas[tabela].numero,
                descricaoSaida: voltaLanche || programacao.quadro.tabelas[tabela].trechos[trecho].inicio.descricao.slice(0,1),
                descricaoChegada: programacao.quadro.tabelas[tabela].trechos[trecho].fim.descricao.slice(0,1),
                saida: programacao.quadro.tabelas[tabela].trechos[trecho].inicio.horario.slice(programacao.quadro.tabelas[tabela].trechos[trecho].inicio.horario.indexOf('T')+1,programacao.quadro.tabelas[tabela].trechos[trecho].inicio.horario.length-3),
                chegada: programacao.quadro.tabelas[tabela].trechos[trecho].fim.horario.slice(programacao.quadro.tabelas[tabela].trechos[trecho].fim.horario.indexOf('T')+1,programacao.quadro.tabelas[tabela].trechos[trecho].fim.horario.length-3),
                empresa:programacao.quadro.tabelas[tabela].trechos[trecho].empresa
               })
        }
    }


    if(programacao.linha.indexOf('Corujão')===-1){
        organizarHorariosNormal(postos)
    }
    else{
        organizarHorariosCorujao(postos)
    }

    let tempoMedio = reduzirHorarios(horariosPostos);
    return [postos,tempoMedio];

}

function organizarHorariosNormal(postos){
    for(let posto in postos){
        postos[posto] = postos[posto].sort((a,b)=>{
            if(a.saida>='00:00' && a.saida<'04:00'){
                return 1;
                
            }
            if(a.saida < b.saida){
                return -1;
            }
            else if(a.saida > b.saida){
                return 1;
            }
            else if(a.saida == b.saida){
                return 0;
            }

        })
    
    }
}

function organizarHorariosCorujao(postos){
    for(let posto in postos){
        postos[posto] = postos[posto].sort((a,b)=>{
            if(a.saida < b.saida){
                return -1;
            }
            else if(a.saida > b.saida){
                return 1;
            }
            else if(a.saida == b.saida){
                return 0;
            }

        })
    
    }
}

function adicionaHorarioPostos(array,postoInicial,horarioInicial,HorarioFinal){

    if(!array[postoInicial]){
        array[postoInicial] = [];
    }

    let tempoInicio = horarioInicial.split(':');
    let minutosInicial = Number((tempoInicio[0]*60))+Number(tempoInicio[1]);

    let tempoFinal = HorarioFinal.split(":");
    let minutosFinal = Number((tempoFinal[0]*60))+Number(tempoFinal[1]);

    let minutosViagem = minutosFinal-minutosInicial;



    if(minutosViagem< -800){

        if(tempoFinal[0]=="00"){

            minutosFinal = 24*60+Number(tempoFinal[1]);
            minutosViagem = minutosFinal-minutosInicial;


        }
        else if(tempoFinal[0]=="01"){
            minutosFinal = 25*60+Number(tempoFinal[1]);
            minutosViagem = minutosFinal-minutosInicial;

        }
    }


    array[postoInicial].push(minutosViagem);
}

function reduzirHorarios(array){

    let temp = {};

    for(let posto in array){
        let qtdDeViagens = array[posto].length;
        let minutosTotal = array[posto].reduce((valor,item)=> valor+item,0);

        temp[posto] = Math.floor(minutosTotal / qtdDeViagens);
    }

    return temp;
}

export function linhasDoPostoSelecionado(posto){
    return linhasPosto[posto];
}

export function listasDePostos(){
    return Object.keys(linhasPosto);
}

