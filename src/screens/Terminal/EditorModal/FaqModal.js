import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import marked from 'marked';

const contents = `
  - Must be valid JSON contents
  - The root object must be an \`object\`, not an \`array\`
  - Each key of the root object will serve as a \`category\`
  - Each \`category\` must be array of \`rows\`
  - Each \`row\` must be array of 5 strings.

  _Example_:
  \`\`\`json
    {
      "Email Accounts": [
        ["[Gmail](https://gmail.com)", "john.doe@gmail.com", "passwurd", "john.doe@gmail.com", "**_Recovery Email_**: lorem@ipsum.com"]
      ],
      "Socials": [
      ]
    }
  \`\`\`
`;

export default ({ isOpen, onToggle }) => (
  <Modal isOpen={isOpen} toggle={onToggle} size="lg">
    <ModalHeader>CIC Data Format</ModalHeader>
    <ModalBody dangerouslySetInnerHTML={{ __html: marked(contents) }}></ModalBody>
    <ModalFooter>
      <Button color="primary" size="sm" onClick={onToggle}>Close</Button>
    </ModalFooter>
  </Modal>
);
