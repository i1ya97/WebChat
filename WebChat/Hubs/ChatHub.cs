using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using Microsoft.AspNet.SignalR;

namespace WebChat.Hubs
{
public class ChatHub : Hub
    {
        ChatBDContainer1 chatBD = new ChatBDContainer1();
        // Отправка сообщений
        public void Send(string name, string message)
        {
            string curDate = DateTime.Now.ToString();
            var item = chatBD.UserSet.Where(b => b.name == name).FirstOrDefault();
            Message mes = new Message { mess = message, date = curDate, User = item };
            chatBD.Entry<Message>(mes).State= EntityState.Added;
            chatBD.SaveChanges();
            Clients.Others.addMessage(name, message, mes.Id,mes.date);
            Clients.Caller.addMessageOne(name, message, mes.Id,mes.date);
        }
 
        // Подключение нового пользователя
        public void Connect(string userName)
        {
            var id = Context.ConnectionId;
            User items;
            if (chatBD.UserSet.Where(z => z.name == userName).FirstOrDefault() == null)
            {
                items = new User { token = id, name = userName, status = true };
                chatBD.Entry<User>(items).State = EntityState.Added;
            }
            else
            {
                items = chatBD.UserSet.Where(z => z.name == userName).FirstOrDefault();

                items.status = true;
                items.token = id;
                chatBD.Entry<User>(items).State = EntityState.Modified;
            }
            chatBD.SaveChanges();
            List<User> users = new List<User>();
            users = chatBD.UserSet.AsQueryable<User>().ToList<User>();
            // Посылаем сообщение текущему пользователю
            Clients.Caller.onConnected(id, userName);
            foreach (User i in users)
            {
                Clients.Caller.allUsers(i.token,i.name,i.status);
            }
            // Посылаем сообщение всем пользователям, кроме текущего
            Clients.AllExcept(id).onNewUserConnected(id, userName);
            int count = chatBD.UserSet.Count();
            if (count - 10 < 0)
            {
                List<Message> mes = chatBD.MessageSet.OrderBy(c => c.Id).Skip(0).ToList();
                foreach (Message i in mes)
                {
                    if (items.Id == i.User.Id)
                    {
                        Clients.Caller.addMessageOne(i.User.name, i.mess,i.Id,i.date);
                    }
                    else
                    {
                        Clients.Caller.addMessage(i.User.name, i.mess,i.Id,i.date);
                    }
                }
            }
            else
            {
                List<Message> mes = chatBD.MessageSet.OrderBy(c => c.Id).Skip(count - 10).ToList();
                foreach (Message i in mes)
                {
                    if (items.Id == i.User.Id)
                    {
                        Clients.Caller.addMessageOne(i.User.name, i.mess, i.Id,i.date);
                    }
                    else
                    {
                        Clients.Caller.addMessage(i.User.name, i.mess,i.Id,i.date);
                    }
                }
            }
        }


        public void del(int id)
        {
            var item = chatBD.MessageSet.FirstOrDefault(x => x.Id == id);
            if (item != null)
            {
                chatBD.Entry<Message>(item).State = EntityState.Deleted;
                chatBD.SaveChanges();
                Clients.All.delitemessage(id);
            }

        }

        // Отключение пользователя
        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            User item = chatBD.UserSet.Where(x => x.token == Context.ConnectionId).FirstOrDefault();
            item.status = false;
            if (item != null)
            {
                Clients.All.onUserDisconnected(item.token, item.name,item.status);
            }
            chatBD.Entry<User>(item).State = EntityState.Modified;
            chatBD.SaveChanges();
            return base.OnDisconnected(stopCalled);
        }
    }
}