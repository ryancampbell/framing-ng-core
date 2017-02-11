# ng-core
Framing Core

Framing is a new concept that changes the level of re-usability in Open Source for Enterprise Web Applications using Angular.

It allows you as the develop to create re-usable modules, or slices of modules.

Instead of the norm in what's released in open sourcing being individual re-usabilble components, you can now develop and release entire screens that are re-usable.

For example, if you add @framing/ng-security to your application you'll have a secure application with login and logout.
All you need to do is configure the SecurityFramer with what API call it should use to authenticate.

Framers are easy to implement, in fact, there is very little difference between a standard Angular NgModule and a Framer.

At Biznas we've made it best pratice to develop everything in Framers.

If done correctly, you'll never need to write the same code twice and every Framer you create decreases the time needed to develop future applications that share similar functionality.

This concept was born out of the pain of dealing with large amounts of duplicate code when developing Enterprise Applications.

The less code you write, the less code you need to test.

Your Framers can continue to evolve and become more proven, stable and secure as you utilize them in future.

Instead of that code being written once and used once, you'll continue to use it and improve it.
