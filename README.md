Diffie-Hellman Key Exchange For Web
===================================

This is a very simple to use implementation of Diffie-Hellman key
exchange function, which exports all exchange material and shared
secrets and keys derived from the shared secrets as strings that are
easy to use for various purposes.


Reference
=========

new WebDH(groupName, hashName)
------------------------------

Constructor for WebDH key exchange object. Group and hash can be fixed
here or left open. If left open, the values are derived from the
remote challenge (if generate is called before challenge) or set to
default values modp2048 and SHA-256 (if challenge is called before
generate).

WebDH.hashes()
--------------

Returns an array of the supported hashes.

WebDH.groups()
--------------

Returns an array of the supported Diffie-Hellman groups.

async WebDH.prototype.challenge()
---------------------------------

Creates a challenge (as a string) that can be set to the other
participant of the key exchange. The other participant is expected to
give this challenge as a parameter to generate call. If this call is
done before calling generate and the group or hash has not been
explicitly set, they will be set to default values modp2048 and
SHA-256 respectively as a side effect of this call.

async WebDH.prototype.generate(remoteChallenge)
-----------------------------------------------

Finalizes the key exchange by importing the challenge string set by
the other participant in the key exchange process. If this call is
done before calling challenge and the group or hash has not been
explicitly set, they will be set to the values set by the remote
participant. If the values has been either explicitly set or set as a
side effect or challenge call, those values must match with the ones
used by the remote participant or error will be thrown.

async WebDH.prototype.secret()
------------------------------

Returns a hash value created from the shared secret value calculated
using the Diffie-Hellman algorithm. The hash value is returned as a
lower case hexadecimal string and the length of the value depends on
the hash function. For the default hash function SHA-256 the length of
the return string is 64 characters (i.e 32 bytes or 256 bits encoded
to hexadecimal). Calling this function before generate throws an
error. This function can be called before calling challenge, but
naturally the other participant of the exchange is not able to
calculate the secret before challenge is called and the result is
delivered to the other participant.

async WebDH.prototype.key(id)
-----------------------------

Returns a named key derived from the shared secret. The key ID is
either an integer or a string. Same ID creates always the same key
from the same secret. The key does not leak information from the
shared secret nor from keys generated with the different ID. Numeric
IDs are converted to string, so key id 42 and '42' will produce the
identical output. Output is always a hexadecimal string similar in
format from the output of secret function. Calling this function
before generate throws an error. There is no need to call function
secret before this call or ever if only named keys are used.

```
// Server                                      // Client
var kex = new WebDH();                         var kex = new WebDH();
// send and receive are                        // send and receive are
// just pseudo calls to                        // just pseudo calls to
// denote that the                             // denote that the
// challenge must be                           // challenge must be
// delivered to the other                      // delivered to the other
// participant somehow.                        // participant somehow.
send(await kex.challenge());     --------->    await kex.generate(receive());
await kex.generate(receive());   <---------    send(await kex.challenge())
var k1 = await kex.key(1);                     var k1 = await kex.key(1);
var k2 = await kex.key(2);                     var k2 = await kex.key(2);
var kf = await kex.key('foo');                 var kf = await kex.key('foo');
// 3 independent keys                          // 3 independent keys
// are now shared between                      // are now shared between
// the client and me.                          // the server and me.
```


Author
======

Timo J. Rinne <tri@iki.fi>


License
=======

MIT License
