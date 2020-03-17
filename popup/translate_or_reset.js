function listenForClicks(){
    document.addEventListener('click',async (e)=>{
        function command(tabs,message){
            browser.tabs.sendMessage(tabs[0].id,{
                command: message,
                token: token,
                secret: secret
            })
        }

        command_translate = (tabs) => (command(tabs,"translate"));
        command_reset = (tabs) => (command(tabs,"reset"));

        id_val = document.querySelector("#id").value
        pass_val = document.querySelector("#pw").value
        credentials = {
            token: id_val,
            secret: pass_val,
        }
        
        if(id_val.length>0 && pass_val.length>0){
            browser.storage.local.set(credentials)
        }

        token = await browser.storage.local.get("token")
        token = token['token']
        secret = await browser.storage.local.get("secret")
        secret = secret['secret']
        console.log(token,secret)

        if(e.target.classList.contains("translate")){
            browser.tabs.query({active:true, currentWindow:true})
                .then(command_translate)
        }
        else if(e.target.classList.contains("reset")){
            browser.tabs.query({active:true, currentWindow:true})
                .then(command_reset)
        }
    });
}

function forErrors(error){
    console.error(`Failed to execute pult script: ${error}`)
}

browser.tabs.executeScript({file: "/content_scripts/pult.js"})
.then(listenForClicks)
.catch(forErrors)