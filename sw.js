{
  "rules": {
    ".read": false,
    ".write": false,

    "users": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid === $uid",
        "name": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 30"
        },
        "voxId": {
          ".write": "auth != null && auth.uid === $uid && !data.exists()",
          ".validate": "newData.isString() && newData.val().matches(/^VOX-[A-Z0-9]{4}$/)"
        },
        "status": {
          ".validate": "newData.isString() && newData.val().length <= 50"
        },
        "avatar": {
          ".validate": "newData.isString() && newData.val().length < 200000"
        }
      }
    },

    "vox_ids": {
      "$voxId": {
        ".read": "auth != null",
        ".write": "auth != null && !data.exists()"
      }
    },

    "groups": {
      "$gid": {
        ".read": "auth != null",
        ".write": "auth != null && (!data.exists() || data.child('creator').val() === auth.uid)",
        "name": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 50" },
        "type": { ".validate": "newData.val() === 'group' || newData.val() === 'channel'" },
        "creator": { ".validate": "newData.val() === auth.uid" },
        "subscribers_count": { ".validate": "newData.isNumber() && newData.val() >= 0" },
        "members": {
          "$uid": {
            ".write": "auth != null && (auth.uid === $uid || root.child('groups').child($gid).child('creator').val() === auth.uid)"
          }
        }
      }
    },

    "chats": {
      "$chatId": {
        ".read": "auth != null && data.child('members').child(auth.uid).exists()",
        ".write": "auth != null && (!data.exists() || data.child('members').child(auth.uid).exists())",
        "members": {
          "$uid": {
            ".write": "auth != null && (auth.uid === $uid || data.parent().child(auth.uid).exists())"
          }
        }
      }
    },

    "messages": {
      "$chatId": {
        ".read": "auth != null && (root.child('user_chats').child(auth.uid).child($chatId).exists() || $chatId === auth.uid + '_FAVORITES' || (root.child('groups').child($chatId).child('members').child(auth.uid).exists()) || (root.child('chats').child($chatId).child('members').child(auth.uid).exists()))",
        ".write": "auth != null && (root.child('user_chats').child(auth.uid).child($chatId).exists() || $chatId === auth.uid + '_FAVORITES' || (root.child('groups').child($chatId).child('members').child(auth.uid).exists()) || (root.child('chats').child($chatId).child('members').child(auth.uid).exists()))",
        "$messageId": {
          ".validate": "newData.hasChildren(['text','sender','timestamp','type','time'])",
          "sender": { ".validate": "newData.val() === auth.uid" },
          "text": { ".validate": "newData.isString() && newData.val().length < 150000" },
          "timestamp": { ".validate": "newData.isNumber() && newData.val() <= now + 60000" },
          "type": { ".validate": "newData.val() === 'text' || newData.val() === 'image' || newData.val() === 'voice'" },
          "time": { ".validate": "newData.isString() && newData.val().length <= 10" },
          "forwarded": { ".validate": "newData.isBoolean()" },
          "edited": { ".validate": "newData.isBoolean()" }
        }
      }
    },

    "user_chats": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid",
        "$chatId": { ".validate": "newData.isBoolean()" }
      }
    },

    "read_status": {
      "$chatId": {
        ".read": "auth != null",
        "$uid": {
          ".write": "auth != null && auth.uid === $uid",
          ".validate": "newData.isBoolean()"
        }
      }
    },

    "typing": {
      "$chatId": {
        ".read": "auth != null",
        "$uid": {
          ".write": "auth != null && auth.uid === $uid",
              ".validate": "newData.val() === 'typing' || newData.val() === 'idle'"
        }
      }
    },

    "status": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid === $uid",
        ".validate": "newData.val() === 'online' || newData.val() === 'offline'"
      }
    }
  }
}
