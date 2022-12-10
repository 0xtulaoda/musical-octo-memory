import type { FC } from 'react';
import React from 'react';

type IndexProps = {};

const Twitter: FC<IndexProps> = (props) => {
  console.log(`props`, props);
  return <div>推特监控</div>;
};

export default Twitter;
