const Database = require('./database/db')

const { subjects, weekdays, getSubject, convertHoursToMinutes } = require('./utils/format')

function pageLanding(req, res) {
    //return res.sendFile(__dirname + "/views/index.html") => isso aqui era a forma de chamar as páginas antes do nunjucks
    return res.render("index.html")
}

async function pageStudy(req, res) {
    const filters = req.query
    //return res.sendFile(__dirname + "/views/study.html") => isso aqui era a forma de chamar as páginas antes do nunjucks

    if (!filters.subject || !filters.weekday || !filters.time) {
        return res.render("study.html", { filters, subjects, weekdays})
    }

    //converter horas em minutos

    const timeToMinutes = convertHoursToMinutes(filters.time)

    const query = `
        SELECT classes.*, proffys.*
        FROM proffys
        JOIN classes ON (classes.proffy_id = proffy_id)
        WHERE EXISTS(
            SELECT class_schedule.*
            FROM class_schedule
            WHERE class_schedule.class_id = classes.id
            AND class_schedule.weekday = ${filters.weekday}
            AND class_schedule.time_from <= ${timeToMinutes}
            AND class_schedule.time_to > ${timeToMinutes}
        )
        AND classes.subject = '${filters.subject}'
        `
    
    // caso haja erro na hora da cunsulta do banco de dados.

    try {
        
        const db = await Database
        const proffys = await db.all(query)

        proffys.map((proffy) => {
            proffy.subject = getSubject(proffy.subject)
        })

        return res.render('study.html' , { proffys, subjects, filters, weekdays })

    } catch (error) {
        console.log(erro)
    }

    //return res.render("study.html", { proffys, filters, subjects, weekdays }) // neste caso vc vai renderizar a página 
}

function pageGiveClasses(req, res){
    
    //se não, mostrar a página
    //return res.sendFile(__dirname + "/views/give-classes.html") => isso aqui era a forma de chamar as páginas antes do nunjucks
    return res.render("give-classes.html", {subjects, weekdays})
}

async function saveClasses(req,res){

    const creatyProffy = require('./database/createProffy')    
    
    const proffyValue = {
        name: req.body.name,
        avatar: req.body.avatar,
        whatsapp: req.body.whatsapp,
        bio: req.body.bio
    }

    const classValue = {
        subject: req.body.subject,
        cost: req.body.cost
    }

    const classScheduleValues = req.body.weekday.map((weekday, index) => {
        return {
            weekday,
            time_from: convertHoursToMinutes(req.body.time_from[index]),
            time_to: convertHoursToMinutes(req.body.time_to[index]),
        }
    })

    try {
        const db = await Database
        await creatyProffy(db, {proffyValue, classValue, classScheduleValues})
        
        let queryString = "?subject" + req.body.subject
        queryString += + "&weekday=" + req.body.weekday[0]
        queryString += + "&time=" + req.body.time_from[0]

        return res.redirect("/study" + queryString) 

        } catch (error) {
            console.log(error)
         }        
        
    }

module.exports = {
    pageLanding,
    pageStudy,
    pageGiveClasses,
    saveClasses
}