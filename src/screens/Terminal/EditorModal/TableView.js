import React from 'react';
import shortid from 'shortid';
import { Table } from 'reactstrap';

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
            <td>{row[0]}</td>
            <td>{row[1]}</td>
            <td>{row[2]}</td>
            <td>{row[3]}</td>
            <td>{row[4]}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  ))
);
