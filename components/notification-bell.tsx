"use client"

import { Bell, MessageSquare, Star } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import Image from 'next/image';

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    return { notifications: [] }
  }
  return res.json()
}

function NotificationItem({ notification, onRead }) {
  const getNotificationContent = () => {
    if (notification.type === 'reply' || notification.type === 'mention') {
      return {
        icon: <MessageSquare className="h-5 w-5 text-blue-400" />,
        title: notification.title || 'New notification',
        message: notification.message || '',
        link: notification.link || '#',
      }
    }

    if (notification.type === 'like') {
      return {
        icon: <Star className="h-5 w-5 text-yellow-400" />,
        title: notification.title || 'New like',
        message: notification.message || '',
        link: notification.link || '#',
      }
    }

    return {
      icon: <Bell className="h-5 w-5" />,
      title: notification.title || 'Notification',
      message: notification.message || '',
      link: notification.link || '#',
    }
  };

  const { icon, title, message, link } = getNotificationContent();

  return (
    <Link href={link} onClick={() => onRead(notification.id)} className="block">
      <div className={`p-2 rounded-md transition-colors ${!notification.is_read ? 'bg-secondary/50' : 'hover:bg-secondary/30'}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">{icon}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{title}</p>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
            <p className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function NotificationBell() {
  const { data, error } = useSWR('/api/notifications', fetcher, { refreshInterval: 30000 });

  const handleMarkAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    });
    mutate('/api/notifications');
  };

  const handleMarkAllAsRead = async () => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    mutate('/api/notifications');
  };

  const unreadCount = data?.notifications?.filter((n: any) => !n.is_read).length || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">{unreadCount}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium leading-none">Notifications</h4>
            <Button variant="link" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>Mark all as read</Button>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {data?.notifications?.length > 0 ? (
              data.notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} onRead={handleMarkAsRead} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No notifications yet.</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
