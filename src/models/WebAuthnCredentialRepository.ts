/**
 * WebAuthn Credential Repository
 * Database operations for WebAuthn credentials with Supabase support
 */

import Repository from './Repository';
import db from '../config/database';
import { supabase } from '../config/supabase';
import { config } from '../config/environment';
import { WebAuthnCredential } from './index';

// Determine if we should use Supabase
const useSupabase = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

/**
 * Repository for WebAuthn credential operations
 */
export default class WebAuthnCredentialRepository extends Repository<WebAuthnCredential> {
  protected tableName = 'webauthn_credentials';
  
  /**
   * Find a credential by credential ID
   */
  async findByCredentialId(credentialId: string): Promise<WebAuthnCredential | null> {
    if (useSupabase) {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('credential_id', credentialId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error finding credential by ID:', error);
      }
      
      return data as WebAuthnCredential || null;
    } else {
      const result = await db.query(
        `SELECT * FROM ${this.tableName} WHERE credential_id = $1`,
        [credentialId]
      );
      
      return result.rows.length ? result.rows[0] as WebAuthnCredential : null;
    }
  }

  /**
   * Find all credentials for a user
   */
  async findAllByUserId(userId: number): Promise<WebAuthnCredential[]> {
    if (useSupabase) {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error finding credentials by user ID:', error);
        return [];
      }
      
      return data as WebAuthnCredential[] || [];
    } else {
      const result = await db.query(
        `SELECT * FROM ${this.tableName} WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      
      return result.rows as WebAuthnCredential[];
    }
  }

  /**
   * Update credential counter
   */
  async updateCounter(credentialId: string, counter: number): Promise<void> {
    if (useSupabase) {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          counter,
          last_used_at: new Date()
        })
        .eq('credential_id', credentialId);
      
      if (error) {
        console.error('Error updating credential counter:', error);
        throw new Error(`Failed to update credential counter: ${error.message}`);
      }
    } else {
      await db.query(
        `UPDATE ${this.tableName} SET counter = $1, last_used_at = NOW() WHERE credential_id = $2`,
        [counter, credentialId]
      );
    }
  }

  /**
   * Delete a credential
   */
  async deleteByCredentialId(credentialId: string): Promise<void> {
    if (useSupabase) {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('credential_id', credentialId);
      
      if (error) {
        console.error('Error deleting credential:', error);
        throw new Error(`Failed to delete credential: ${error.message}`);
      }
    } else {
      await db.query(
        `DELETE FROM ${this.tableName} WHERE credential_id = $1`,
        [credentialId]
      );
    }
  }

  /**
   * Enable WebAuthn for a user
   */
  async enableWebAuthnForUser(userId: number): Promise<void> {
    if (useSupabase) {
      const { error } = await supabase
        .from('users')
        .update({ webauthn_enabled: true })
        .eq('id', userId);
      
      if (error) {
        console.error('Error enabling WebAuthn for user:', error);
        throw new Error(`Failed to enable WebAuthn: ${error.message}`);
      }
    } else {
      await db.query(
        `UPDATE users SET webauthn_enabled = true WHERE id = $1`,
        [userId]
      );
    }
  }

  /**
   * Disable WebAuthn for a user
   */
  async disableWebAuthnForUser(userId: number): Promise<void> {
    if (useSupabase) {
      const { error } = await supabase
        .from('users')
        .update({ webauthn_enabled: false })
        .eq('id', userId);
      
      if (error) {
        console.error('Error disabling WebAuthn for user:', error);
        throw new Error(`Failed to disable WebAuthn: ${error.message}`);
      }
    } else {
      await db.query(
        `UPDATE users SET webauthn_enabled = false WHERE id = $1`,
        [userId]
      );
    }
  }

  /**
   * Check if user has any WebAuthn credentials
   */
  async userHasCredentials(userId: number): Promise<boolean> {
    if (useSupabase) {
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error checking if user has credentials:', error);
        return false;
      }
      
      return count ? count > 0 : false;
    } else {
      const result = await db.query(
        `SELECT user_has_webauthn_credentials($1) AS has_credentials`,
        [userId]
      );
      
      return result.rows[0].has_credentials;
    }
  }

  /**
   * Rename a credential
   */
  async renameCredential(credentialId: string, name: string): Promise<void> {
    if (useSupabase) {
      const { error } = await supabase
        .from(this.tableName)
        .update({ name })
        .eq('credential_id', credentialId);
      
      if (error) {
        console.error('Error renaming credential:', error);
        throw new Error(`Failed to rename credential: ${error.message}`);
      }
    } else {
      await db.query(
        `UPDATE ${this.tableName} SET name = $1 WHERE credential_id = $2`,
        [name, credentialId]
      );
    }
  }
}