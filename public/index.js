$("input").on("click", function(evt){
    //get id of div to be removed
    let completedTaskId = $(this).parent().attr("id");
    console.log(completedTaskId);

    setTimeout(function (){
        $(`#${completedTaskId}`).remove();
    }, 100);
})