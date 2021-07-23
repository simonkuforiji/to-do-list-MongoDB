exports.getDate = () => {
    const today = new Date();
        let options = {
            weekday: "long",
            day: "numeric",
            month: "long",
        }
    return today.toLocaleDateString("en-US", options);
}

exports.getDateWithYear = () => {
    const today = new Date();
        let options = {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    return today.toLocaleDateString("en-US", options);
}