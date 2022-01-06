// function which draws the table to display on the website to the user
function draw_table(){
    $("#results").empty();
    $.getHTMLuncached = function(url) {
        return $.ajax({
            url: url,
            type: 'GET',
            cache: false,
            success: function(html) {
                $("#results").append(html);
                select_row();
            }
        });

    };
    $.getHTMLuncached("/get/html");
};

// function which adds the new entry to the menu
function append(){
    $.ajax({
        type: "POST",
        url: '/post/json',
        dataType: 'json',
        contentType: 'application/json',
        data: '{"w_day": "' + $("#week_day").val() + '", "item":"' + $("#item").val() + '", "price":"' + $("#price").val() + '"}',
        async: false,
        // once the new entry is added, the new table will be drawed with the new entry included
        success: setTimeout(draw_table, 1000)
    });
};
// function which defines the selected entry to be removed
function select_row()
{
    $("#menuTable tbody tr[id]").click(function ()
    {
        $(".selected").removeClass("selected");
        $(this).addClass("selected");
        var sec = $(this).prevAll("tr").children("td[colspan='3']").length - 1;
        var ent = $(this).attr("id") - 1;
        delete_row(sec, ent);
    })

};
// function which removes the selected entry
function delete_row(sec, ent){
    $("#delete").click(function()
    {
        $.ajax(
            {
                url: "/post/delete",
                type: "POST",
                dataType: 'json',
                contentType: 'application/json',
                data: '{"sec": "' + sec + '", "ent": "' + ent + '"}',
                cache: false,
                // once the selected entry is removed, the new table will be drawed without the selected entry removed 
                success: setTimeout(draw_table, 1000)
            }
        )
    })
};
// displays table
$(document).ready(function(){
    draw_table();
});