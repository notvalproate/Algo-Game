$("#playButton").click((event) => {
    event.preventDefault();

    const roomKey = $("#roomKey").val();
    const username = $("#username").val();

    $.ajax({
        url: `/${roomKey}/play`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({roomKey: roomKey, username: username}),
        success: (res) => {
            console.log("ajax success");
        }
    })
})