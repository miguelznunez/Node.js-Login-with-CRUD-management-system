const getDate = () => {
    let yourDate = new Date()
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - (offset*60*1000));
    yourDate = yourDate.toISOString().split('T')[0]
    yourDate = yourDate.split("-")
    return `${yourDate[1]}/${yourDate[2]}/${yourDate[0]}` 
}

module.exports = { getDate }