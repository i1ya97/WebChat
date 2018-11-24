$(function () {
    $('#frame').hide();
    $('#loginBlock').show();
    // Ссылка на автоматически-сгенерированный прокси хаба
    var chat = $.connection.chatHub;
    // Объявление функции, которая хаб вызывает при получении сообщений
    chat.client.addMessage = function (name, message,id,date) {
        // Добавление сообщений на веб-страницу 
        $('#chatroom').append('<li id="mes' + id + '"><div class="name"><span class="">' + htmlEncode(name) + '</span></div><div class="message"><p>' + htmlEncode(message) + '</p><span class="msg-time">'+date+'</span></div></li>');
    };
    chat.client.addMessageOne = function (name, message, id,date) {
        // Добавление сообщений на веб-страницу 
        $('#chatroom').append('<li id="mes' + id + '"><div class="name"><span class="">' + htmlEncode(name) + '</span></div><div class="message"><p>' + htmlEncode(message) + '<input type="checkbox" name="a" value="' + id +'"></p><span class="msg-time">'+date+'</span></div></li>');
    };
    
    // Функция, вызываемая при подключении нового пользователя
    chat.client.onConnected = function (id, userName) {

        $('#loginBlock').hide();
        $('#frame').show();
        // установка в скрытых полях имени и id текущего пользователя
        $('#hdId').val(id);
        $('#username').val(userName);
        $('#user').append('<div class="name"><span>' + userName + '<span class="availability">В сети</span></div>');
        }
    chat.client.allUsers = function (token, name, status) {
        AddUser(token,name, status);
    }

    // Добавляем нового пользователя
    chat.client.onNewUserConnected = function (id, name) {

        AddUser(id, name, true);
    }
    // Удаляем пользователя
    chat.client.onUserDisconnected = function (id, userName,status) {

        $('#' + userName).remove();
        $("#chatusers").append('<li id="' + userName + '"><span class="status offline"><i class="fa fa-circle-o"></i></span><span>' + userName + '  (offline)</span></li>');
    }

    chat.client.deliteMessage = function (id) {

        $('#mes' + id).remove();
    }

    // Открываем соединение
    $.connection.hub.start().done(function () {

        $('#sendmessage').click(function () {
            // Вызываем у хаба метод Send
            if ($('#message').val() !== '') {
                chat.server.send($('#username').val(), $('#message').val());
                $('.emoji-wysiwyg-editor').empty();
            }
        });

        $('#del').click(function () {
            // Вызываем у хаба метод deletemessage
            var $unique = $('input[type=checkbox]:checked').val();

            var clickId = $unique;
            chat.server.del(clickId);
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
