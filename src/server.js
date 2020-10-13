//Servidor
const express = require('express')
const server = express()

const {
        pageLanding,
        pageStudy,
        pageGiveClasses,
        saveClasses
} = require('./pages')
// configuração do nunjucks (template engine)
// após a config do nunjucks eu altero as funções resposta de sendFile para render
const nunjucks = require('nunjucks')
nunjucks.configure('src/views',{
    express: server,
    noCache: true,
})

//inicio e configuração do servidor
server
//receber dados do req.body
.use(express.urlencoded({extended: true}))
.use(express.static("public")) // configuração de arquivos estáticos como (css, scripts,  imagens,etc)
.get("/", pageLanding) //rotas da aplicação
.get("/study", pageStudy) //rotas da aplicação
.get("/give-classes", pageGiveClasses) //rotas da aplicação
.post ("/save-classes", saveClasses)
.listen(5500) //start do servidor
