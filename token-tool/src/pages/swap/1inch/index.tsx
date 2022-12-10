import React from 'react';

import Iframe from 'react-iframe';

const inchUrl='https://app.1inch.io/'

const Inch: React.FC = () => {

  return (
    <Iframe
      url={inchUrl}
      width="100%"
      height="1000px"
      id="myId"
      className="myClassname"
      display="initial"
      position="relative"
    />
  );
};

export default Inch;
