const checkBrowser = (headers) => {
    var ba = ["Chrome","Firefox","Safari","Opera","MSIE","Trident", "Edge"];
    var b, ua = headers['user-agent'];
    for(var i=0; i < ba.length;i++){
      if(ua.indexOf(ba[i]) > -1){
        b = ba[i];
        break;
      }
    }
    // IF INTERNET EXPLORER IS BEING USED RETURN TRUE OTHERWISE RETURN FALSE
    if(b === "MSIE" || b === "Trident") return true;
    else return false
}

const getDate = () => {
    let yourDate = new Date()
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - (offset*60*1000));
    yourDate = yourDate.toISOString().split('T')[0]
    yourDate = yourDate.split("-")
    return `${yourDate[1]}/${yourDate[2]}/${yourDate[0]}` 
}

module.exports = { checkBrowser, getDate }