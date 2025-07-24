import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { linhasDoPostoSelecionado, organizarInformacoes } from "./assets/funcoes.js";

const app = fastify();

app.register(fastifyCors,{
    origin: '*'
});

app.get('/',(request,reply)=>{
    reply.send("Server Running");
});

app.get('/linhas/:nome?', async(request,reply)=>{
    if(request.params){
        const {nome} = request.params;
        const requisicao = await fetch(`http://gistapis.etufor.ce.gov.br:8081/api/linhas/${nome}`); 
        const dados = await requisicao.json();
        return reply.status(200).send(dados);
    }
    const requisicao = await fetch('http://gistapis.etufor.ce.gov.br:8081/api/linhas'); 
    const dados = await requisicao.json();
    return reply.status(200).send(dados);
});

app.get("/Programacao/:linha", async(request,reply)=>{
    const {linha} = request.params;
    const {data} = request.query;
    if(request.query.empresa){
        const {empresa} = request.query;
        const requesicao =  await fetch(`http://gistapis.etufor.ce.gov.br:8081/api/Programacao/${linha}?data=${data}&empresa=${empresa}`);
        const dados = await requesicao.json();
        reply.status(200).send(dados);
    }
    const requesicao =  await fetch(`http://gistapis.etufor.ce.gov.br:8081/api/Programacao/${linha}?data=${data}`);
    const dados = await requesicao.json();
    const informacoesLinha = organizarInformacoes(dados);

    const quadroDeHorarioArray = Object.entries(informacoesLinha[1]);


    reply.status(200).send({
        informacoesLinha: informacoesLinha[0],
        quadroDeHorario: quadroDeHorarioArray,
        aproveitamentos: informacoesLinha[2]
    });
});


app.get("/ProgramacaoNormal/:linha", async(request,reply)=>{
    const {linha} = request.params;
    const {data} = request.query;
    if(request.query.empresa){
        const {empresa} = request.query;
        const requesicao =  await fetch(`http://gistapis.etufor.ce.gov.br:8081/api/Programacao/${linha}?data=${data}&empresa=${empresa}`);
        const dados = await requesicao.json();
        reply.status(200).send(dados);
    }
    const requesicao =  await fetch(`http://gistapis.etufor.ce.gov.br:8081/api/Programacao/${linha}?data=${data}`);
    const dados = await requesicao.json();

    reply.status(200).send(dados);
});

app.get("/linhasDoPosto/:posto", async(request,reply)=>{
    const {posto} = request.params;
    if(posto){
        const linhas = linhasDoPostoSelecionado(posto);
        reply.status(200).send(linhas);
    }
});

app.get("/postoControle/:posto?",async(request,reply)=>{
    if(request.params){
        const {posto} = request.params;
        const requisicao = await fetch(`http://gistapis.etufor.ce.gov.br:8081/api/postoControle/${posto}`); 
        const dados = await requisicao.json();
        return reply.status(200).send(dados);
    }
    const requisicao = await fetch(`http://gistapis.etufor.ce.gov.br:8081/api/postoControle`); 
    const dados = await requisicao.json();
    return reply.status(200).send(dados);
});


app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333
    }).then(()=>{
        console.log("server running");
    });