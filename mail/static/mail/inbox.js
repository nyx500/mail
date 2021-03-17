document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    document.querySelector('#compose-form').onsubmit = function() {

        let emailObj = {
            recipients: document.querySelector('#compose-recipients').value,
            subject: document.querySelector('#compose-subject').value,
            body: document.querySelector('#compose-body').value
        }

        fetch('/emails', {
                method: 'POST',
                body: JSON.stringify(emailObj)
            }).then(response => response.json()).then(result => {

                console.log(result);

                if (result.error) {

                    document.querySelector('#message').innerHTML = `SENDING FAILED: ${result.error}`
                    document.querySelector('#message').style.color = 'red';
                    document.querySelector('#compose-recipients').value = '';

                    if (result.error !== "POST request required.") {
                        document.querySelector('#compose-recipients').style.outline = '2px solid red';
                        document.querySelector('#compose-recipients').placeholder = "Please enter the email address of an existing (valid) recipient!";
                    }

                } else {
                    load_mailbox('sent');
                }
            })
            .catch(err => console.log(err));

        return false;
    };
}


function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            console.log(emails);
            emails.forEach(email => {

                const emailDiv = document.createElement('div');
                emailDiv.style.border = '1.6px solid black';
                emailDiv.style.padding = '5px';
                emailDiv.style.display = 'flex';

                if (email.read && mailbox === 'inbox') {
                    emailDiv.style.backgroundColor = 'grey';
                }

                document.querySelector('#emails-view').append(emailDiv);

                const senderDiv = document.createElement('div');
                senderDiv.innerHTML = email.sender;
                senderDiv.style.fontWeight = 'bold';
                emailDiv.append(senderDiv);

                const subjectDiv = document.createElement('div');
                subjectDiv.innerHTML = email.subject;
                subjectDiv.style.marginLeft = '22px';
                emailDiv.append(subjectDiv);

                const timestampDiv = document.createElement('div');
                timestampDiv.innerHTML = email.timestamp;
                timestampDiv.style.color = 'grey';
                timestampDiv.style.marginLeft = 'auto';
                emailDiv.append(timestampDiv);

            })
        });
};