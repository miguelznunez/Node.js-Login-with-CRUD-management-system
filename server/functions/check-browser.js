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

module.exports = { checkBrowser }