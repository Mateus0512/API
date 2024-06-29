import fastify from "fastify";
// import fastifyCors from "@fastify/cors";

const app = fastify();

// app.register(fastifyCors,{
//     origin: '*'
// });

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
    reply.status(200).send(dados);
});


app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333
    }).then(()=>{
        console.log("server running");
    });