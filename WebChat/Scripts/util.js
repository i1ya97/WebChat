$(function () {
    $('#frame').hide();
    $('#loginBlock').show();

    var chat = $.connection.chatHub;
    // Объявление функции, которую хаб вызывает при получении сообщений
    /*chat.client.addMessage = function (name, message,id,date) {
        // Добавление сообщений на веб-страницу 
        $('#chatroom').append('<li id="mes' + id + '"><div class="name"><span class="">' + htmlEncode(name) + '</span></div><div class="message"><p>' + htmlEncode(message) + '</p><span class="msg-time">'+date+'</span></div></li>'
        );*/

    $('.submit').click(function () {
        newMessage();
    });

    $(window).on('keydown', function (e) {
        if (e.which === 13) {
            newMessage();
            return false;
        }
    });

    chat.client.addMessage = function (name, message, id, date) {
        $('<li class="replies"><img src="http://emilcarlsson.se/assets/mikeross.png" alt="" /><p>' + message + '</p></li>').appendTo($('.messages ul'));
        $('.message-input input').val(null);
        $('.contact.active .preview').html('<span>You: </span>' + message);
        $(".messages").animate({ scrollTop: $(document).height() }, "fast");
    };
    chat.client.addMessageOne = function (name, message, id,date) {
        // Добавление сообщений на веб-страницу 
        $('<li class="sent"><img src="http://emilcarlsson.se/assets/mikeross.png" alt="" /><p>' + message + '</p></li>').appendTo($('.messages ul'));
        $('.message-input input').val(null);
        $('.contact.active .preview').html('<span>You: </span>' + message);
        $(".messages").animate({ scrollTop: $(document).height() }, "fast");
    };
    
    // Функция, вызываемая при подключении нового пользователя
    chat.client.onConnected = function (id, userName) {

        $('#loginBlock').hide();
        $('#frame').show();
        // установка в скрытых полях имени и id текущего пользователя
        $('#hdId').val(id);
        $('#username').val(userName);
        $('#profile').append('<div class="wrap"><img id="profile-img" src="http://emilcarlsson.se/assets/mikeross.png" class="online" alt="" /><p>' + userName + '</p><i class="fa fa-chevron-down expand-button" aria-hidden="true"></i><div id="status-options"><ul><li id="status-online" class="active"><span class="status-circle"></span> <p>Online</p></li><li id="status-away"><span class="status-circle"></span> <p>Away</p></li><li id="status-busy"><span class="status-circle"></span> <p>Busy</p></li><li id="status-offline"><span class="status-circle"></span> <p>Offline</p></li></ul></div><div id="expanded"><label for="twitter"><i class="fa fa-facebook fa-fw" aria-hidden="true"></i></label><input name="twitter" type="text" value="mikeross" /><label for="twitter"><i class="fa fa-twitter fa-fw" aria-hidden="true"></i></label><input name="twitter" type="text" value="ross81" /><label for="twitter"><i class="fa fa-instagram fa-fw" aria-hidden="true"></i></label><input name="twitter" type="text" value="mike.ross" /></div></div>');
    };
    chat.client.allUsers = function (token, name, status) {
        AddUser(token, name, status);
    };

    // Добавляем нового пользователя
    chat.client.onNewUserConnected = function (id, name) {
        AddUser(id, name, true);

    };

    // Удаляем пользователя
    chat.client.onUserDisconnected = function (id, userName, status) {

        $('#' + userName).remove();
        $("#chatusers").append('<li id="' + userName + '"><span class="status offline"><i class="fa fa-circle-o"></i></span><span>' + userName + '  (offline)</span></li>');
    };

    chat.client.deliteMessage = function (id) {

        $('#mes' + id).remove();
    };


    // Открываем соединение
    $.connection.hub.start().done(function () {

        $('#sendmessage').click(function () {
            // Вызываем у хаба метод Send
            if ($('#message').val() !== '') {
                chat.server.send($('#username').val(), $('#message').val());
                $('.emoji-wysiwyg-editor').empty();
            }
        });


        // обработка логина
        $("#btnLogin").click(function () {

            var name = $("#txtUserName").val();
            if (name.length > 0) {
                chat.server.connect(name);
            }
            else {
                alert("Введите имя");
            }
        });
    });
});

function newMessage() {
    message = $(".message-input input").val();
    if ($.trim(message) === '') {
        return false;
    }
    chat.server.send("dsgsdgds","dsgsdgsdg");
    $('<li class="sent"><img src="http://emilcarlsson.se/assets/mikeross.png" alt="" /><p>' + message + '</p></li>').appendTo($('.messages ul'));
    $('.message-input input').val(null);
    $('.contact.active .preview').html('<span>You: </span>' + message);
    $(".messages").animate({ scrollTop: $(document).height() }, "fast");
}

// Кодирование тегов
function htmlEncode(value) {
    var encodedValue = $('<div />').text(value).html();
    return encodedValue;
}
//Добавление нового пользователя
function AddUser(id, name,status) {

    var userId = $('#hdId').val();

    if (userId !== id) {
        if (status === true) {
            $('#' + name).remove();
            $("#chatusers").append('<li id="'+name+'"><span class="status online"><i class="fa fa-circle-o"></i></span><span>'+name+'  (online)</span></li>');
        } else {
            $('#' + name).remove();
            $("#chatusers").append('<li id="' + name + '"><span class="status offline"><i class="fa fa-circle-o"></i></span><span>' + name + '  (offline)</span></li>');
        }
    } else {
        $('#' + name).remove();
        $("#chatusers").append('<li id="' + name + '"><span class="status online"><i class="fa fa-circle-o"></i></span><span>' + name + '  (online)</span></li>');
    }
}
