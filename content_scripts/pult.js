(function(){
    if(window.hasRun){
        return;
    }
    window.hasRun=true

    translations = null
    original = null
    apiToken = null
    apiSecret = null

    async function makeTranslationRequest(token,secret,text){
        return new Promise(function (resolve,reject){
          http = new XMLHttpRequest();
          http.open("POST","https://stetstet.xyz/translate/",true);
          http.setRequestHeader('content-type','application/x-www-form-urlencoded');
          params = "token="+token+"&secret="+secret+"&text="+text
          http.onreadystatechange = function () {
            if (http.readyState==4 && this.status>=200 && this.status<300){ 
              resolve(this.response); 
            } else if(http.readyState==4){
              reject({status:this.status,statusText:this.statusText});
            }
          }
          http.send(params)
        })
    }

    async function applyTranslations(){
        ret = {}
        if(original === null) original = {}
        if(translations === null) translations = {}
        for(let i=0;;i++){
            if(i>0){
                query = "#L"+i
            }else{
                query = "p.novel_subtitle"
            }
            if(translations[query] === undefined){
                element = document.querySelector(query);
                if(element === null) break;
                text = element.innerText;
                processed = text.trim().replace(/^[（『《　「…]+/,'').replace(/[」…》』）]$/,'');
                if (processed.length===0){
                    continue;
                }else{
                    original[query] = text;
                    translation = makeTranslationRequest(apiToken,apiSecret,processed);
                    translation = await translation
                    text = text.replace(processed,translation);
                    translations[query] = text;
                }
            }
            document.querySelector(query).innerText = translations[query];
        }
    }

    function reset(){
        console.log("reset")
        if(original===null){
            return
        } else{
            for(let query in original){
                document.querySelector(query).innerText = original[query];
            }
        }
    }

    browser.runtime.onMessage.addListener(async (message)=>{
        apiToken=message.token;
        apiSecret=message.secret;
        if(message.command == "translate"){
            await applyTranslations();
        } else if (message.command === "reset"){
            reset();
        }
    });

})();