import React from 'react';
import shortid from 'shortid';
import { markdown } from 'markdown';
import { Table, Button } from 'reactstrap';

export default ({ data }) => (
  Object.keys(data).map(category => (
    <Table key={shortid.generate()} striped bordered className="cic-data-table">
      <caption>{category}</caption>
      <thead>
        <tr>
          <th>Service Provider</th>
          <th>Login</th>
          <th>Password</th>
          <th>Associated Email</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {data[category].map(row => (
          <tr key={shortid.generate()}>
            <td dangerouslySetInnerHTML={{ __html: markdown.toHTML(row[0]) }} />
            <td>{row[1]}</td>
            <td onClick={e => window.getSelection().selectAllChildren(e.target)}>{row[2]}</td>
            <td>{row[3]}</td>
            <td dangerouslySetInnerHTML={{ __html: markdown.toHTML(row[4]) }} />
          </tr>
        ))}
      </tbody>
    </Table>
  ))
);
