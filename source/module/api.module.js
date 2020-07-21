const got = require('got')

module.exports = {
    'get-api-request': async (email) => {
        try {
            const response = await got(process.env.API_URL)
            
            for(clients of JSON.parse(response.body))
                if(clients.email === email)
                    return clients
        }catch(error){
            console.log(error)
        }
    }
}