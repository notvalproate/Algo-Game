# Algo-Game

Recreation of the japanese game called Algo Basic as a webapp.

### To run the server:
```bash
npm run devstart
```

<script>
    document.addEventListener("DOMContentLoaded", function(){

        errorCondition = <%- disError %>;
        var noRoom = document.getElementById('noRoom');
        var fullRoom = document.getElementById('fullRoom');

        if(disError){
            fullRoom.style.display = "block";
        }else{
            noRoom.style.disply = "block";
        }


    });

</script>

