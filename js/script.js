/*
Author: Joseph Kreifels II
Date: January 12th, 2024.
*/

"use strict";

const btnBack = document.getElementById("btnBack");
const btnOptions = document.getElementById("btnOptions");
const appbarName = document.getElementById("appbar-name");

let [currentPage,lastPage] = ["Loading",""];
let changeRequest = false; // Depended on by onpopstate event.
let curContact = null; // The current contact we're speaking to.


window.onpopstate = function(event) {
    // If you're like me, you're probably swiping backwards on your phone out of muscle memory while navigating the GUI, so we will add that functionality
    // With onpopstate. 

    //Simulate a backbutton press ONLY if anchor was changed by the browser and NOT by the pageChange() function. 
    if (!changeRequest) {
        
        // If already on the main screen, force the user to the previous website. This prevents you from potentially needing to press the back-button dozens of times just to leave the webpage.
        if (currentPage == "Messages") {
            history.back();
        }

        backButton();  // Go back as expected.
    }   
}; 

window.onload = function(event) {
    let txtArea = document.getElementById("userInput")
    const optionForm = document.getElementById('optionForm');     
   

    // Update options when changed
    optionForm.addEventListener('change', (event) => {
        const { name, value } = event.target;

        if (options.hasOwnProperty(name)) {
            options[name] = value;
        } else {
            console.error(`options.${name} does not exist.`);
        }

    });   
    
    // send what's in the textarea with the Enter key.
	txtArea.addEventListener("keydown", function(e) {
		if (e.key === "Enter" && e.shiftKey == false) {
				e.preventDefault();
				sendMessage();
		}
	});

    appbarName.addEventListener('click', function() {
        loadProfile();
    });


    // Landing Page
    listContacts();

    // I disabled caching on my website. So with multiple contacts, you can begin to see each of their photos load before your eyes.
    // Having a forced loading screen proves usefull.
    setTimeout(function() {
		pageChange("Messages");
	} ,300);
    


}


const listContacts = () => {
    const container = document.getElementById("page-Messages");
    const colors = ["#9DFF9D87","#9DA4FF87","#FF9D9D87","#F5853Bc3","#F53B73c3"];

    for (let contact of contacts) {
        let contactMessage = document.createElement('div');
        contactMessage.className = "messageContact";
    
        let contactImg = document.createElement('img');
        contactImg.src = contact.picture;
    
        // If no image exist, use their first initial inplace of the image
        if (!contact.picture) {
            contactImg = document.createElement('dive');
            contactImg.className = "noContactImg";
            contactImg.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            contactImg.innerText = contact.name[0].toLocaleUpperCase();
            
        }


        let contactName = document.createElement('div');
        let lastMessage = contact.chatHistory[contact.chatHistory.length-1];

        if (lastMessage) {
            if (lastMessage.role == "user") {
                lastMessage = `You: ${lastMessage.content}`;
            } else {
                lastMessage = lastMessage.content;
            }
        } else {
            lastMessage = "<i>New conversation...</i>";
        }
    
       contactName.innerHTML = `${contact.name}<br><sub class="lastMessage" id="last-${contact.id}">${lastMessage}</sub>`;



        contactMessage.appendChild(contactImg);
        contactMessage.appendChild(contactName);

        contactMessage.addEventListener('click', function() {
            loadChat(contact);
        });

        container.appendChild(contactMessage);

    }
}


// Updates the last message from each contact without repopulating the entire list of names and photos.
const updateContacts = () => {
    

    for (let contact of contacts) {
        
        let lastMessage = contact.chatHistory[contact.chatHistory.length-1];

        if (!lastMessage) continue;

        if (lastMessage.role == "user") {
            lastMessage = `You: ${lastMessage.content}`;
        } else {
            lastMessage = lastMessage.content;
        }

        document.getElementById(`last-${contact.id}`).innerHTML = lastMessage;
    }

}


const loadChat = (contact) => {
    
    curContact = contact;
    
    // With caching turned off, I am going to load these in the background.
    document.getElementById("profile-image").src = (curContact.picture) ? curContact.picture : "img/profiles/unknown.webp";
    document.getElementById("profile-bio").innerText = curContact.bio;

    // Wipe
    document.getElementById('chat-container').innerHTML = "";

    // Reload
    if (contact.chatHistory.length) {
        for (let message of contact.chatHistory) {
            appendMessage(message.content,message.role);
        }
    }
    
    pageChange("Chat");
    scrollToBottom();
}

const sendMessage = () => {
    let input = document.getElementById("userInput");
    if (!input.value) return;


    curContact.chatHistory.push({'role': "user",'content': input.value})
    appendMessage(input.value, "user");

    input.value = "";
    input.focus();

    // Just for testing. Simulate getting a response. You should implement your own mechanics/function.
    getResponse();

}


const appendMessage = (text, who) => {

    let chatContainer = document.getElementById('chat-container');
	let chatMessage = document.createElement('div');

	chatMessage.className = `message ${who}-message`;

    /* \n to <br> */
	let newLines = text.split('\n');
	const container = document.createElement('div');

	newLines.forEach((line, index) => {
		container.appendChild(document.createTextNode(line));
		if (index < newLines.length - 1) {
			container.appendChild(document.createElement('br'));
		}
	});

	chatMessage.appendChild(container);    
    chatContainer.appendChild(chatMessage);

	scrollToBottom();

}

const scrollToBottom = () => {
    const chatContainer = document.getElementById('chat-container');
	chatContainer.scrollTop = chatContainer.scrollHeight;
	window.scrollTo(0, 0);
}


/* FOR TESTING - Random response */
const getResponse = () => {
    let message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut fringilla leo nec elit vulputate, nec fermentum leo pretium. Pellentesque et nunc urna. Sed quis lectus vitae est porttitor posuere a ut nulla. Nam at dapibus orci. In euismod mi convallis sapien consectetur, eget mollis elit fringilla. Nullam ac erat nunc. Praesent non suscipit libero. Nulla congue orci in quam aliquam sodales. Suspendisse elementum ornare sapien ut accumsan. Aliquam condimentum orci mauris, vel vehicula nulla semper sed. Maecenas eu iaculis mauris, at tempus sem. Maecenas in neque vitae augue scelerisque posuere non scelerisque mi. Proin finibus convallis est in mattis.";
    let newMessage = "";

    message = message.split(" ");

    let startIndex = Math.floor(Math.random() * message.length);
    let endEIndex = Math.floor(Math.random() * (message.length - startIndex ) ) + startIndex;

    // No more than 15 words, please.
    if (endEIndex - startIndex > 15) endEIndex = startIndex + 15;

    for (let i = startIndex; i <= endEIndex; i++) {
        newMessage+= message[i] + " ";
    }

    curContact.chatHistory.push({'role': "friend",'content': newMessage})
    setTimeout(appendMessage,1000,newMessage, "friend");

}

// With caching turned off, I am going to load these in the background.
const loadProfile = () => {
    if (currentPage == "Chat") {
        pageChange("Profile");
    }
}

const backButton = () => {
    
    // Don't allow BACK functionality from the main screen.
    if (currentPage == "Messages") {
        return;
    }

    // Don't go back to options or profile.
    if (lastPage == "Options" || lastPage == "Profile") {
        lastPage = "Messages";
    }        

    pageChange(lastPage);
    

}

const optButton = () => {
    pageChange("Options");
}

const pageChange = (nextPage) => {

    [currentPage, lastPage] = [nextPage,currentPage];
    


    document.getElementById(`page-${lastPage}`).classList.add("hidden");
    document.getElementById(`page-${currentPage}`).classList.remove("hidden");


    // hide the back button on the top most page.
    if (currentPage == "Messages") {
        btnBack.style.visibility = "hidden";
        curContact = "";
        updateContacts();
    } else {
        btnBack.style.visibility = "visible";
    }

    // hides the option button 
    if (currentPage == "Options" || currentPage == "Profile" || currentPage == "Login") {
        btnOptions.style.visibility = "hidden";
    } else {
        btnOptions.style.visibility = "visible";
    }

    // display the correct title on the app bar.
    if (currentPage != "Chat" && currentPage != "Profile") {
        appbarName.innerText = currentPage;
    } else {
        appbarName.innerText = curContact.name;
        
    }

    // Make a page anchor change. This allows us to swipe backwards on mobile phones  (The intended target of this app) or use browser's back button without leaving the page.
    changeRequest = true;
    window.location.hash = `#${currentPage}`;
    history.replaceState(null, document.title, window.location.pathname); // Not needed, but keeps URL tidy for desktop users. Removes "#PAGENAME" from url.
    changeRequest = false;
    
}




const optionChange = (property, value) => {
    if (options.hasOwnProperty(property)) {
        options[property] = value;
    } else {
        console.error(`options.${property} does not exist.`);
    }
}


let contacts = [
    {
        "id": "0000",
        'name': 'John Doe',
        'bio': 'John Doe is just an average everyday guy with a knack for turning ordinary stuff into something cool. Born in a tiny town, John mastered the art of "Extreme Pillow Fluffing" and now works magic with numbers on paper, making the office a better place. When he\'s not goofing off at work, you can catch him juggling rubber ducks or busting out some funky dance moves at the local coffee shop\'s talent night.',
        'picture': "img/profiles/john.webp",
        'chatHistory': [ 
            {'role': 'friend','content':'Hey joe, how\'s it going!'},
            {'role': 'user','content':'Great. Check out this mobile chat web-app!'},
            {'role': 'friend','content':'This is awesome. Check this out Lorem ipsum dolor sit amet, consectetur adipiscing elit!'},
            {'role': 'user','content':'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit!'},
            {'role': 'friend','content':'Woah! WOAH!!'},
            {'role': 'friend','content':'That\'s a lot of text!'},
            {'role': 'user','content':'😉'}
        ]
    },
    {
        "id": "0001",
        'name': 'Jane Doe',
        'bio': 'Jane Doe, the unsung maestro of hilarity, thrives in the shadow of her older brother, the legendary John Doe. Born in the same small town where her brother\'s quirks became folklore, Jane carved her own niche with a passion for "Balloon Animal Theory". In the realm of humor, Jane Doe shines as the unsung star, proving that laughter is a family legacy worth celebrating!',
        'picture': "img/profiles/jane.webp",
        'chatHistory': [ {'role': 'friend','content':'Hey! What\'s up? '}

        ]
    },
    // Dummy contacts after this point to create a scrollable list, and demonstrate how they look without a contact image.
    {
        "id": "0002",
        'name': 'A. Dummy',
        'bio': 'Empty Sample Profile For Letter A',
        'picture': "",
        'chatHistory': [ ]
    },    
    {
        "id": "0003",
        'name': 'B. Dummy',
        'bio': 'Empty Sample Profile For Letter B',
        'picture': "",
        'chatHistory': [{'role': 'friend','content':'heeeeeeeeeeeeeeeey '} ]
    },     
    {
        "id": "0004",
        'name': 'C. Dummy',
        'bio': 'Empty Sample Profile For Letter C',
        'picture': "",
        'chatHistory': [ {'role': 'user','content':'yoyoyo!'}]
    }, 
    {
        "id": "0005",
        'name': 'D. Dummy',
        'bio': 'Empty Sample Profile For Letter D',
        'picture': "",
        'chatHistory': [{'role': 'friend','content':'can i borrow some money?'}, {'role': 'user','content':'how much?'}, {'role': 'friend','content':'I need about $3.50'} ]
    }, 
    {
        "id": "0006",
        'name': 'E. Dummy',
        'bio': 'Empty Sample Profile For Letter E',
        'picture': "",
        'chatHistory': [{'role': 'friend','content':'we\'ve been trying to reach you about your car\'s extended warranty. If you do not act now you may lose all coverage.'} ]
    }, 
    {
        "id": "0007",
        'name': 'F. Dummy',
        'bio': 'Empty Sample Profile For Letter F',
        'picture': "",
        'chatHistory': [ ]
    }, 
    {
        "id": "0008",
        'name': 'G. Dummy',
        'bio': 'Empty Sample Profile For Letter G',
        'picture': "",
        'chatHistory': [ ]
    },  
    {
        "id": "0009",
        'name': 'H. Dummy',
        'bio': 'Empty Sample Profile For Letter H',
        'picture': "",
        'chatHistory': [ ]
    },  
    {
        "id": "0010",
        'name': 'I. Dummy',
        'bio': 'Empty Sample Profile For Letter I',
        'picture': "",
        'chatHistory': [ ]
    },    
    {
        "id": "0011",
        'name': 'J. Dummy',
        'bio': 'Empty Sample Profile For Letter J',
        'picture': "",
        'chatHistory': [ ]
    },                              
];


// You set these options using the options page.
let options = {
    'alias': '',
    'optPref': "A"
};


