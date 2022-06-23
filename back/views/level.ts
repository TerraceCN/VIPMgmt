import { router } from '.';

import { LevelResponse } from '../../interfaces/level';

router.get('/level', async (req, res) => {
  const response: LevelResponse = [
    {
      id: 1,
      name: '青铜会员',
      credit: 0,
    },
    {
      id: 2,
      name: '白银会员',
      credit: 1000,
    },
    {
      id: 3,
      name: '黄金会员',
      credit: 3000,
    }
  ];
  res.json(response);
});
