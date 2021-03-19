document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', () => compose_email(null));

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email(emailExists) {

    // Show compose view and hide other views
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';


    if (emailExists === null) {
        // Clear out composition fields if person has not clicked 'reply'
        document.querySelector('#compose-recipients').value = '';
        document.querySelector('#compose-subject').value = '';
        document.querySelector('#compose-body').value = '';
    } else {
        document.querySelector('#compose-recipients').value = emailExists.sender;
        document.querySelector('#compose-recipients').style.color = 'blue';
        if (emailExists.subject.substring(0, 3).toUpperCase() === 'RE:') {
            document.querySelector('#compose-subject').value = emailExists.subject;
        } else {
            document.querySelector('#compose-subject').value = `Re: ${emailExists.subject}`;
        }
        document.querySelector('#compose-subject').style.color = 'blue';
        document.querySelector('#compose-body').style.whiteSpace = 'pre-line';
        document.querySelector('#compose-body').value = `On ${emailExists.timestamp} ${emailExists.sender} wrote: ${emailExists.body}\n\n`;

    }

    document.querySelector('#compose-form').onsubmit = send_email;
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#email-view').style.display = 'none';
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
                emailDiv.onmouseover = function() {
                    emailDiv.style.cursor = 'pointer';
                }
                emailDiv.onmouseleave = function() {
                    emailDiv.style.cursor = 'default';
                }

                if (email.read && mailbox === 'inbox') {
                    emailDiv.style.backgroundColor = 'grey';
                }

                document.querySelector('#emails-view').append(emailDiv);


                const personDiv = document.createElement('div');

                // Shows only the first recipient if there is a whole list of recipients
                if (mailbox === 'sent') {
                    if (email.recipients.length > 1) {
                        personDiv.innerHTML = `Sent to: ${email.recipients[0]}[...]`;
                    } else {
                        personDiv.innerHTML = `Sent to: ${email.recipients}`;
                    }
                } else {
                    personDiv.innerHTML = email.sender;
                }

                personDiv.style.fontWeight = 'bold';
                emailDiv.append(personDiv);

                const subjectDiv = document.createElement('div');
                subjectDiv.innerHTML = email.subject;
                subjectDiv.style.marginLeft = '22px';
                emailDiv.append(subjectDiv);

                const timestampDiv = document.createElement('div');
                timestampDiv.innerHTML = email.timestamp;
                if (emailDiv.style.backgroundColor === 'grey') {
                    timestampDiv.style.color = 'black';
                } else {
                    timestampDiv.style.color = 'grey';
                }
                timestampDiv.style.marginLeft = 'auto';
                emailDiv.append(timestampDiv);

                emailDiv.addEventListener('click', () => {
                    load_email(email, mailbox);
                });
            });
        })
};

function load_email(email, mailbox) {

    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#email-view').style.whiteSpace = 'pre';

    fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    });

    fetch(`/emails/${email.id}`)
        .then(response => response.json())
        .then(email => {


            // Empties div every time email is clicked on, so that the email doesn't keep getting appended every time
            const emailContainer = document.querySelector('#email-view');
            emailContainer.textContent = '';

            emailMessageDiv = document.createElement('div');
            emailMessageDiv.style.border = '1px solid black';
            emailMessageDiv.style.padding = '10px';
            emailMessageDiv.style.display = 'flex';
            emailMessageDiv.style.flexDirection = 'column';
            document.querySelector('#email-view').append(emailMessageDiv);

            console.log(emailMessageDiv);

            const subject = document.createElement('div');
            subject.style.order = '1';
            if (email.subject.substring(0, 3).toUpperCase() === 'RE:') {
                subject.innerHTML = `<h3>${email.subject}</h3>`;
            } else {
                subject.innerHTML = `<h3>Subject: ${email.subject}</h3>`;
            }
            emailMessageDiv.append(subject);

            const senderAndTime = document.createElement('div');
            senderAndTime.style.paddingTop = '10px';
            senderAndTime.style.order = '2';
            senderAndTime.style.display = 'flex';
            senderAndTime.style.flexDirection = 'row';
            const sender = document.createElement('div');
            sender.style.order = '1';
            sender.style.marginLeft = '0';
            sender.innerHTML = `<h6>From: ${email.sender}</h6>`;
            senderAndTime.append(sender);
            const time = document.createElement('div');
            time.style.order = '2';
            time.style.marginLeft = 'auto';
            time.style.color = 'rgb(100,100,100)';
            time.innerHTML = `<p>${email.timestamp} </p>`;
            senderAndTime.append(time);
            emailMessageDiv.append(senderAndTime);

            const recipients = document.createElement('div');
            recipients.style.order = '3';
            recipients.innerHTML = `<h6>Recipients: ${email.recipients}</h6>`;
            emailMessageDiv.append(recipients);

            const body = document.createElement('div');
            body.style.order = '4';
            body.style.paddingTop = '20px';
            body.style.minHeight = '20px';
            body.style.paddingBottom = '20px';
            body.innerHTML = email.body;
            emailMessageDiv.append(body);

            const buttonArray = document.createElement('div');
            buttonArray.style.order = '5';
            buttonArray.style.display = 'flex';
            buttonArray.style.flexDirection = 'row';
            buttonArray.style.paddingTop = '10px';
            emailMessageDiv.append(buttonArray);

            const archiveButton = document.createElement('button');
            archiveButton.style.order = '1';
            archiveButton.style.borderRadius = '4px';
            archiveButton.style.color = 'dodgerblue';
            archiveButton.style.border = '2px solid dodgerblue';
            archiveButton.style.backgroundColor = 'powderblue';
            archiveButton.addEventListener('mouseover', () => {
                archiveButton.style.backgroundColor = 'skyblue';
            })
            archiveButton.addEventListener('mouseleave', () => {
                archiveButton.style.backgroundColor = 'powderblue';
            })

            if (email.archived === false) {
                archiveButton.innerHTML = 'Archive';
            } else {
                archiveButton.innerHTML = 'Unarchive';
            }

            buttonArray.append(archiveButton);

            archiveButton.onclick = function() {

                if (archiveButton.innerHTML === 'Archive') {
                    fetch(`/emails/${email.id}`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                archived: true
                            })
                        })
                        .then(() => {
                            load_mailbox('inbox');
                        });
                } else {
                    fetch(`/emails/${email.id}`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                archived: false
                            })
                        })
                        .then(() => {
                            load_mailbox('inbox');
                        });
                }
            }

            const replyButton = document.createElement('button');
            replyButton.style.order = '2';
            replyButton.style.marginLeft = '10px';
            replyButton.style.borderRadius = '4px';
            replyButton.style.color = 'rebeccapurple';
            replyButton.style.border = '2px solid rebeccapurple';
            replyButton.style.backgroundColor = 'thistle';
            replyButton.addEventListener('mouseover', () => {
                replyButton.style.backgroundColor = 'plum';
            })
            replyButton.addEventListener('mouseleave', () => {
                replyButton.style.backgroundColor = 'thistle';
            })

            replyButton.innerHTML = 'Reply';

            console.log(mailbox);

            if (mailbox === 'inbox') {
                buttonArray.append(replyButton);
            }

            replyButton.addEventListener('click', () => compose_email(email));
        });
}

function send_email() {

    let emailObj = {
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: `${document.querySelector('#compose-body').value}`
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
}