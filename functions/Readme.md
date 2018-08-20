# PickUP Sports Functions
This is the backend functions project that provides API level access to the data.  Most functionality is already built into firebase/firestore, but things that needed to be accomplished automagically are performed within this project.

To use it install the firebase cli tools on your development environment, configure it to your database location and run a 
<br><br>
<code>firebase deploy -only functions</code>

It will then watch the necessary locations within the database and fire functions based on triggered actions.