-- Fix: Add missing read column to notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;