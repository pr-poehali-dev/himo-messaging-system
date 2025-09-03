import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  username: string;
  uniqueId: string;
  status: 'online' | 'offline' | 'banned';
  role: 'user' | 'admin';
  lastSeen?: string;
  friends: number[];
}

interface Chat {
  id: number;
  name: string;
  type: 'private' | 'group' | 'channel';
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'bot';
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [friendId, setFriendId] = useState('');
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<User[]>([
    { id: 1, username: 'Himo', uniqueId: 'HIMO001', status: 'online', role: 'admin', friends: [] },
  ]);
  
  const [chats] = useState<Chat[]>([
    { id: 1, name: 'Общий чат', type: 'group', lastMessage: 'Привет всем!', timestamp: '14:30', unread: 2 },
    { id: 2, name: 'Техподдержка', type: 'channel', lastMessage: 'Бот: Как дела?', timestamp: '14:25', unread: 0 },
    { id: 3, name: 'Разработка', type: 'group', lastMessage: 'Обсуждаем новые фичи', timestamp: '13:45', unread: 5 },
  ]);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'user1', content: 'Привет всем!', timestamp: '14:30', type: 'text' },
    { id: 2, sender: 'AutoBot', content: 'Добро пожаловать в чат! Я могу помочь с автоматизацией задач.', timestamp: '14:31', type: 'bot' },
  ]);

  const generateUniqueId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleLogin = () => {
    if (username === 'Himo' && password === '12345678') {
      const admin = users.find(u => u.username === 'Himo');
      setCurrentUser(admin || null);
      setIsAuthenticated(true);
    } else if (username && password) {
      const user = users.find(u => u.username === username);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    }
  };

  const handleRegister = () => {
    if (username && password) {
      const existingUser = users.find(u => u.username === username);
      if (!existingUser) {
        const newUser: User = {
          id: users.length + 1,
          username,
          uniqueId: generateUniqueId(),
          status: 'online',
          role: 'user',
          friends: []
        };
        setUsers([...users, newUser]);
        setCurrentUser(newUser);
        setIsAuthenticated(true);
      }
    }
  };

  const handleAddFriend = () => {
    if (friendId && currentUser) {
      const friendUser = users.find(u => u.uniqueId === friendId);
      if (friendUser && friendUser.id !== currentUser.id && !currentUser.friends.includes(friendUser.id)) {
        setUsers(users.map(user => {
          if (user.id === currentUser.id) {
            return { ...user, friends: [...user.friends, friendUser.id] };
          }
          if (user.id === friendUser.id) {
            return { ...user, friends: [...user.friends, currentUser.id] };
          }
          return user;
        }));
        setCurrentUser({ ...currentUser, friends: [...currentUser.friends, friendUser.id] });
        setFriendId('');
      }
    }
  };

  const handleDeleteUser = (userId: number) => {
    if (currentUser?.role === 'admin' && userId !== 1) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedChat) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: currentUser?.username || 'Аноним',
        content: message,
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
        type: 'text'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      if (message.includes('/bot') || message.includes('бот')) {
        setTimeout(() => {
          const botResponse: Message = {
            id: messages.length + 2,
            sender: 'AutoBot',
            content: 'Обрабатываю вашу команду автоматизации...',
            timestamp: new Date().toLocaleTimeString().slice(0, 5),
            type: 'bot'
          };
          setMessages(prev => [...prev, botResponse]);
        }, 1000);
      }
    }
  };

  const handleUserAction = (userId: number, action: 'ban' | 'unban' | 'makeAdmin') => {
    if (currentUser?.role === 'admin') {
      setUsers(users.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'ban':
              return { ...user, status: 'banned' as const };
            case 'unban':
              return { ...user, status: 'offline' as const };
            case 'makeAdmin':
              return { ...user, role: 'admin' as const };
            default:
              return user;
          }
        }
        return user;
      }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Icon name="MessageCircle" className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Himo</CardTitle>
            <p className="text-muted-foreground">{isRegistering ? 'Создайте новый аккаунт' : 'Войдите в систему'}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder={isRegistering ? 'Создайте пароль' : 'Пароль (для админа: 12345678)'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button 
              onClick={isRegistering ? handleRegister : handleLogin} 
              className="w-full" 
              disabled={!username || !password}
            >
              {isRegistering ? 'Зарегистрироваться' : 'Войти'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsRegistering(!isRegistering)} 
              className="w-full"
            >
              {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="MessageCircle" className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold">Himo</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {currentUser?.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{currentUser?.username}</span>
                  {currentUser?.role === 'admin' && (
                    <Badge variant="secondary" className="text-xs">Admin</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">ID: {currentUser?.uniqueId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-5 m-2">
              <TabsTrigger value="chats" className="text-xs">
                <Icon name="MessageSquare" className="w-4 h-4 mr-1" />
                Чаты
              </TabsTrigger>
              <TabsTrigger value="friends" className="text-xs">
                <Icon name="UserPlus" className="w-4 h-4 mr-1" />
                Друзья
              </TabsTrigger>
              <TabsTrigger value="groups" className="text-xs">
                <Icon name="Users" className="w-4 h-4 mr-1" />
                Группы
              </TabsTrigger>
              <TabsTrigger value="channels" className="text-xs">
                <Icon name="Hash" className="w-4 h-4 mr-1" />
                Каналы
              </TabsTrigger>
              {currentUser?.role === 'admin' && (
                <TabsTrigger value="admin" className="text-xs">
                  <Icon name="Shield" className="w-4 h-4 mr-1" />
                  Админ
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="chats" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-2">
                  <div className="relative mb-4">
                    <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Поиск чатов..." className="pl-10" />
                  </div>
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedChat?.id === chat.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                      }`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-muted">
                            {chat.type === 'group' && <Icon name="Users" className="w-4 h-4" />}
                            {chat.type === 'channel' && <Icon name="Hash" className="w-4 h-4" />}
                            {chat.type === 'private' && chat.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{chat.name}</span>
                            <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                        </div>
                        {chat.unread > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs px-2">
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="friends" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Добавить друга</h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Введите ID пользователя"
                        value={friendId}
                        onChange={(e) => setFriendId(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button onClick={handleAddFriend} disabled={!friendId}>
                        <Icon name="UserPlus" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-medium mb-4">Мои друзья ({currentUser?.friends.length || 0})</h3>
                  {currentUser?.friends.map(friendId => {
                    const friend = users.find(u => u.id === friendId);
                    if (!friend) return null;
                    return (
                      <div key={friend.id} className="flex items-center gap-3 p-3 rounded-lg border mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-white">
                            {friend.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{friend.username}</div>
                          <div className="text-xs text-muted-foreground">ID: {friend.uniqueId}</div>
                          <div className={`text-xs ${
                            friend.status === 'online' ? 'text-green-500' :
                            friend.status === 'banned' ? 'text-destructive' : 'text-muted-foreground'
                          }`}>
                            {friend.status === 'online' ? 'В сети' :
                             friend.status === 'banned' ? 'Заблокирован' : 'Не в сети'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {currentUser?.friends.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Icon name="UserPlus" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>У вас пока нет друзей</p>
                      <p className="text-xs">Добавьте друзей по их ID</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="groups" className="flex-1 m-0">
              <div className="p-4 text-center text-muted-foreground">
                <Icon name="Users" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Группы появятся здесь</p>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="flex-1 m-0">
              <div className="p-4 text-center text-muted-foreground">
                <Icon name="Hash" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Каналы появятся здесь</p>
              </div>
            </TabsContent>

            {currentUser?.role === 'admin' && (
              <TabsContent value="admin" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <h3 className="font-medium mb-4">Управление пользователями ({users.length})</h3>
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={
                              user.status === 'banned' ? 'bg-destructive text-destructive-foreground' :
                              user.role === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }>
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{user.username}</span>
                              {user.role === 'admin' && (
                                <Badge variant="secondary" className="text-xs">Admin</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">ID: {user.uniqueId}</div>
                            <div className="text-xs text-muted-foreground">Друзей: {user.friends?.length || 0}</div>
                            <span className={`text-xs ${
                              user.status === 'online' ? 'text-green-500' :
                              user.status === 'banned' ? 'text-destructive' : 'text-muted-foreground'
                            }`}>
                              {user.status === 'online' ? 'В сети' :
                               user.status === 'banned' ? 'Заблокирован' : 'Не в сети'}
                            </span>
                          </div>
                        </div>
                        {user.username !== currentUser?.username && (
                          <div className="flex gap-1">
                            {user.status !== 'banned' ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleUserAction(user.id, 'ban')}
                              >
                                <Icon name="Ban" className="w-3 h-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, 'unban')}
                              >
                                <Icon name="UserCheck" className="w-3 h-3" />
                              </Button>
                            )}
                            {user.role !== 'admin' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, 'makeAdmin')}
                              >
                                <Icon name="Crown" className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Icon name="Trash2" className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-white">
                      {selectedChat.type === 'group' && <Icon name="Users" className="w-4 h-4" />}
                      {selectedChat.type === 'channel' && <Icon name="Hash" className="w-4 h-4" />}
                      {selectedChat.type === 'private' && selectedChat.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium">{selectedChat.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.type === 'group' ? 'Группа' :
                       selectedChat.type === 'channel' ? 'Канал' : 'Личные сообщения'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'bot' ? 'justify-start' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        msg.type === 'bot' 
                          ? 'bg-secondary text-secondary-foreground' 
                          : msg.sender === currentUser?.username
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{msg.sender}</span>
                          {msg.type === 'bot' && (
                            <Badge variant="secondary" className="text-xs">Bot</Badge>
                          )}
                        </div>
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-xs opacity-70">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Напишите сообщение... (попробуйте '/bot' для автоматизации)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!message.trim()}>
                    <Icon name="Send" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <Icon name="MessageSquare" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Выберите чат</h3>
                <p className="text-muted-foreground">Начните общение, выбрав чат из списка</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;