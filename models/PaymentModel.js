'use strict';


class PaymentModel extends Backendless.ServerCode.PersistenceItem {
  constructor(name) {
    super();

    /**
     * @type {String}
     */
    this.name = name || '';
  }
}

module.exports = Backendless.ServerCode.addType(PaymentModel);
