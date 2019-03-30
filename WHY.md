# Why I started this project.

2 things made me interested in GraphQL. 

1. Everyone is talking about it.
2. [`atdgen`](https://github.com/ahrefs/bs-atdgen-codec-runtime) + `bs-fetch` was a bit boilerplate-y and quirky. And it was really burdensome to use `atdgen` in Windows. (Maybe, my unfamiliarity with opam is the problem.)

So, I started learning GraphQL and porting Apollo GraphQL's [official example](https://github.com/apollographql/fullstack-tutorial) in ReasonML with [Reason-Apollo](https://github.com/apollographql/reason-apollo) library. 

But I met several roadblocks. For example, to simulate "..." syntax in JavaScript with Js.Json.t in ReasonML, I had to write some Json functions. ([You can check the code here.](https://github.com/sainthkh/space-client/blob/master/src/pages/LaunchesPage.re))

And Mutation component was ReasonML-ish. In ReasonML, change of states are handled in reducer. But it uses its own property because `react-apollo` does that in that way. 

And reason-apollo didn't support local states. It supported `writeQuery`, `readQuery`. But they were very inconvenient. 

So, I decided to move to Relay.

At first, Relay was good. Especially, I liked the idea that [the data declaration should be located with the component. Or **declarative data-fetching** if I borrow their own words.](https://facebook.github.io/relay/docs/en/thinking-in-relay.html) 

And no one created the ReasonML version of Relay. [Although many people want it.](https://github.com/facebook/relay/issues/2231)

So, I decided to create reason-relay. After finishing hello world and trying to move on, I understood why Relay, the Facebook's own GraphQL library, lost the war to Apollo. 

It was [Relay Server Specification](https://facebook.github.io/relay/docs/en/graphql-server-specification.html). To handle array of items with Relay, we need to define them in edges and nodes. 

I'm not saying edges and nodes are bad. They're necessary in some cases. But making them mandatory for everything is overkill. Because that makes schema over-complicated. 

So, I decided to move back to Apollo and create my own version of reason-apollo. 

But this time, I had to answer this crucial question. 

**Can we define a universial cache tool for every app under the sun?** 

Apollo's answer was yes. But mine was no. 

We can categorize react apps in many ways. But I believe all of them are somewhere between in 2 extremes:

* Read-heavy apps: Their major job is to show data. (i.e. Keyword Tools. ERP systems.)
* Write-heavy apps: Their major job is to edit things. (i.e. Project Tools. Image editors.)

Then, can we design an efficient cache for both scenarios? It might be because of my lack of experience. My answer was no. 

So, I decided to create a new GraphQL library for ReasonML that does only 2 things well: 

1. Fetch data from server. 
2. Decode that data into ReasonML record. 

And this project is the result. 

Although I criticized the 2 major players in GraphQL world, I personally thank both libraries. 

Because I have stolen a lot of useful ideas from both of them. 

* From Relay: declarative data-fetching and compiler. 
* From Apollo: `MakeRequest` functor is an adaptation of `MakeQuery`. 

In other words, without them, I couldn't make this library.