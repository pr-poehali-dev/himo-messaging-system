import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  username: string;
  uniqueId: string;
  status: 'online' | 'offline' | 'banned';
  role: 'user' | 'admin';
  lastSeen?: string;
  friends: number[];
  bio?: string;
  avatar?: string;
  verified?: boolean;
}

interface Chat {
  id: number;
  name: string;
  type: 'private' | 'group' | 'channel';
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
  participants?: number[];
  creator?: number;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'bot';
  chatId: number;
}

interface Report {
  id: number;
  reporterId: number;
  reportedUserId: number;
  reason: string;
  timestamp: string;
  status: 'pending' | 'resolved';
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
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  
  // Настройки профиля
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileBio, setProfileBio] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  
  // Репорт пользователя
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportUserId, setReportUserId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  
  // Создание канала
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');

  // Загрузка данных из localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('himoUsers');
    const savedChats = localStorage.getItem('himoChats');
    const savedMessages = localStorage.getItem('himoMessages');
    const savedReports = localStorage.getItem('himoReports');
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const defaultAdmin: User = {
        id: 1, 
        username: 'Himo', 
        uniqueId: 'HIMO001', 
        status: 'online', 
        role: 'admin', 
        friends: [],
        bio: 'Создатель Himo',
        verified: true
      };
      const initialUsers = [defaultAdmin];
      setUsers(initialUsers);
      localStorage.setItem('himoUsers', JSON.stringify(initialUsers));
    }

    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, []);

  // Сохранение данных в localStorage
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('himoUsers', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('himoChats', JSON.stringify(chats));
    }
  }, [chats]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('himoMessages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem('himoReports', JSON.stringify(reports));
    }
  }, [reports]);

  const generateUniqueId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleLogin = () => {
    if (username && password) {
      const user = users.find(u => u.username === username);
      if (user) {
        if (user.role === 'admin' && password !== '12345678') {
          return;
        }
        setCurrentUser(user);
        setIsAuthenticated(true);
        setUsername('');
        setPassword('');
      }
    }
  };

  const handleRegister = () => {
    if (username && password) {
      const existingUser = users.find(u => u.username === username);
      if (!existingUser) {
        const newUser: User = {
          id: Math.max(...users.map(u => u.id), 0) + 1,
          username,
          uniqueId: generateUniqueId(),
          status: 'online',
          role: 'user',
          friends: [],
          bio: '',
          verified: false
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        setCurrentUser(newUser);
        setIsAuthenticated(true);
        setUsername('');
        setPassword('');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setSelectedChat(null);
    setMessage('');
    setFriendId('');
    setActiveTab('chats');
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
    if (message.trim() && selectedChat && currentUser) {
      const newMessage: Message = {
        id: Math.max(...messages.map(m => m.id), 0) + 1,
        sender: currentUser.username,
        content: message,
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
        type: 'text',
        chatId: selectedChat.id
      };
      setMessages([...messages, newMessage]);
      
      // Обновляем последнее сообщение в чате
      setChats(chats.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, lastMessage: message, timestamp: newMessage.timestamp }
          : chat
      ));
      
      setMessage('');
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

  const handleVerifyUser = (userId: number) => {
    if (currentUser?.role === 'admin') {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, verified: !user.verified } : user
      ));
    }
  };

  const handleUpdateProfile = () => {
    if (currentUser && profileUsername) {
      setUsers(users.map(user => 
        user.id === currentUser.id 
          ? { ...user, username: profileUsername, bio: profileBio }
          : user
      ));
      setCurrentUser({ ...currentUser, username: profileUsername, bio: profileBio });
      setIsProfileOpen(false);
    }
  };

  const handleStartPrivateChat = (friendId: number) => {
    const friend = users.find(u => u.id === friendId);
    if (friend && currentUser) {
      // Проверяем, существует ли уже приватный чат
      const existingChat = chats.find(chat => 
        chat.type === 'private' && 
        chat.participants?.includes(currentUser.id) && 
        chat.participants?.includes(friendId)
      );

      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        // Создаем новый приватный чат
        const newChat: Chat = {
          id: Math.max(...chats.map(c => c.id), 0) + 1,
          name: friend.username,
          type: 'private',
          lastMessage: 'Начните общение...',
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          unread: 0,
          participants: [currentUser.id, friendId]
        };
        
        setChats([...chats, newChat]);
        setSelectedChat(newChat);
      }
      setActiveTab('chats');
    }
  };

  const handleReportUser = () => {
    if (reportUserId && reportReason && currentUser) {
      const newReport: Report = {
        id: Math.max(...reports.map(r => r.id), 0) + 1,
        reporterId: currentUser.id,
        reportedUserId: reportUserId,
        reason: reportReason,
        timestamp: new Date().toLocaleString(),
        status: 'pending'
      };
      
      setReports([...reports, newReport]);
      setIsReportOpen(false);
      setReportReason('');
      setReportUserId(null);
    }
  };

  const handleCreateChannel = () => {
    if (channelName && currentUser) {
      const newChannel: Chat = {
        id: Math.max(...chats.map(c => c.id), 0) + 1,
        name: channelName,
        type: 'channel',
        lastMessage: 'Канал создан',
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
        unread: 0,
        creator: currentUser.id,
        participants: [currentUser.id]
      };
      
      setChats([...chats, newChannel]);
      setIsChannelOpen(false);
      setChannelName('');
      setChannelDescription('');
    }
  };

  const handleResolveReport = (reportId: number) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status: 'resolved' } : report
    ));
  };

  // Открытие профиля при авторизации
  useEffect(() => {
    if (currentUser) {
      setProfileUsername(currentUser.username);
      setProfileBio(currentUser.bio || '');
    }
  }, [currentUser]);

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

  const chatMessages = messages.filter(msg => msg.chatId === selectedChat?.id);

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
              <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-white text-sm">
                        {currentUser?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{currentUser?.username}</span>
                        {currentUser?.verified && (
                          <Icon name="BadgeCheck" className="w-4 h-4 text-blue-500" />
                        )}
                        {currentUser?.role === 'admin' && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">ID: {currentUser?.uniqueId}</span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Настройки профиля</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Имя пользователя</Label>
                      <Input
                        id="username"
                        value={profileUsername}
                        onChange={(e) => setProfileUsername(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">О себе</Label>
                      <Textarea
                        id="bio"
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        placeholder="Расскажите о себе..."
                      />
                    </div>
                    <Button onClick={handleUpdateProfile}>
                      Сохранить изменения
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <Icon name="LogOut" className="w-4 h-4 mr-1" />
              Выйти
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-4 m-2">
              <TabsTrigger value="chats" className="text-xs">
                <Icon name="MessageSquare" className="w-4 h-4 mr-1" />
                Чаты
              </TabsTrigger>
              <TabsTrigger value="friends" className="text-xs">
                <Icon name="UserPlus" className="w-4 h-4 mr-1" />
                Друзья
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
                  {chats.filter(chat => 
                    chat.participants?.includes(currentUser?.id || 0) || 
                    chat.type === 'channel'
                  ).map((chat) => (
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
                  {chats.filter(chat => chat.participants?.includes(currentUser?.id || 0) || chat.type === 'channel').length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Icon name="MessageSquare" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>У вас пока нет чатов</p>
                      <p className="text-xs">Добавьте друзей или создайте канал</p>
                    </div>
                  )}
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
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{friend.username}</span>
                            {friend.verified && (
                              <Icon name="BadgeCheck" className="w-3 h-3 text-blue-500" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">ID: {friend.uniqueId}</div>
                          <div className={`text-xs ${
                            friend.status === 'online' ? 'text-green-500' :
                            friend.status === 'banned' ? 'text-destructive' : 'text-muted-foreground'
                          }`}>
                            {friend.status === 'online' ? 'В сети' :
                             friend.status === 'banned' ? 'Заблокирован' : 'Не в сети'}
                          </div>
                          {friend.bio && (
                            <div className="text-xs text-muted-foreground mt-1">{friend.bio}</div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartPrivateChat(friend.id)}
                          >
                            <Icon name="MessageSquare" className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setReportUserId(friend.id);
                              setIsReportOpen(true);
                            }}
                          >
                            <Icon name="Flag" className="w-3 h-3" />
                          </Button>
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

            <TabsContent value="channels" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <div className="mb-4">
                    <Button onClick={() => setIsChannelOpen(true)} className="w-full">
                      <Icon name="Plus" className="w-4 h-4 mr-2" />
                      Создать канал
                    </Button>
                  </div>
                  <h3 className="font-medium mb-4">Мои каналы</h3>
                  {chats.filter(chat => chat.type === 'channel' && chat.creator === currentUser?.id).map((channel) => (
                    <div key={channel.id} className="p-3 rounded-lg border mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-muted">
                            <Icon name="Hash" className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{channel.name}</div>
                          <div className="text-xs text-muted-foreground">Создано вами</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
                              {user.verified && (
                                <Icon name="BadgeCheck" className="w-3 h-3 text-blue-500" />
                              )}
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
                            <Button
                              size="sm"
                              variant={user.verified ? "default" : "outline"}
                              onClick={() => handleVerifyUser(user.id)}
                            >
                              <Icon name="BadgeCheck" className="w-3 h-3" />
                            </Button>
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
                    
                    <h3 className="font-medium mb-4 mt-6">Репорты ({reports.filter(r => r.status === 'pending').length})</h3>
                    {reports.filter(r => r.status === 'pending').map((report) => {
                      const reporter = users.find(u => u.id === report.reporterId);
                      const reported = users.find(u => u.id === report.reportedUserId);
                      return (
                        <div key={report.id} className="p-3 rounded-lg border mb-2 bg-yellow-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium">
                                {reporter?.username} → {reported?.username}
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {report.timestamp}
                              </div>
                              <div className="text-sm">{report.reason}</div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleResolveReport(report.id)}
                            >
                              Решено
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {reports.filter(r => r.status === 'pending').length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        <p>Нет активных репортов</p>
                      </div>
                    )}
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
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${
                      msg.sender === currentUser?.username ? 'justify-end' : 'justify-start'
                    }`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        msg.type === 'bot' 
                          ? 'bg-secondary text-secondary-foreground' 
                          : msg.sender === currentUser?.username
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                      }`}>
                        {msg.sender !== currentUser?.username && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">{msg.sender}</span>
                            {msg.type === 'bot' && (
                              <Badge variant="secondary" className="text-xs">Bot</Badge>
                            )}
                          </div>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-xs opacity-70">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Icon name="MessageSquare" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Начните общение</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Напишите сообщение..."
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

      {/* Модальные окна */}
      
      {/* Репорт пользователя */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Пожаловаться на пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Причина жалобы</Label>
              <Textarea
                id="reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Опишите нарушение..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleReportUser} disabled={!reportReason}>
                Отправить жалобу
              </Button>
              <Button variant="outline" onClick={() => setIsReportOpen(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Создание канала */}
      <Dialog open={isChannelOpen} onOpenChange={setIsChannelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать канал</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="channelName">Название канала</Label>
              <Input
                id="channelName"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Введите название канала"
              />
            </div>
            <div>
              <Label htmlFor="channelDesc">Описание</Label>
              <Textarea
                id="channelDesc"
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
                placeholder="Описание канала (опционально)"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateChannel} disabled={!channelName}>
                Создать канал
              </Button>
              <Button variant="outline" onClick={() => setIsChannelOpen(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;