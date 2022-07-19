import smartpy as sp

class Henbane(sp.Contract):
    def __init__(self, token, metadata, admin):
        self.init(
            token = token,
            metadata = metadata,
            admin = admin,
            data = sp.big_map(tkey=sp.TNat, tvalue=sp.TRecord(holder=sp.TAddress, author = sp.TAddress, amount=sp.TNat, token_id=sp.TNat, collectable=sp.TBool)),
            counter = 0,
            token_id = 0,
            )

    @sp.entry_point
    def mint(self, params):
        sp.verify((params.amount > 0))
        c = sp.contract(
            sp.TRecord(
                address=sp.TAddress,
                amount=sp.TNat,
                token_id=sp.TNat,
                metadata=sp.TMap(sp.TString, sp.TBytes)
            ), 
            self.data.token, 
            entry_point = "mint").open_some()
            
        sp.transfer(
            sp.record(
                address = sp.self_address,
                amount = 1,
                token_id = self.data.token_id,
                metadata={ '' : params.metadata }
            ), 
            sp.mutez(0), 
            c)
        
        self.data.data[self.data.token_id] = sp.record(holder=sp.self_address, author = sp.sender, amount = params.amount, token_id=self.data.token_id, collectable=True)
        self.data.token_id += 1
    
    @sp.entry_point
    def collect_management_rewards(self, params):
        sp.verify(sp.sender == self.data.admin)

        sp.send(params.address, params.amount)

    @sp.entry_point
    def collect(self, params):
        sp.verify(((sp.amount == sp.utils.nat_to_mutez(self.data.data[params.token_id].amount)) & (self.data.data[params.token_id].amount != 0) & (self.data.data[params.token_id].collectable == True) & (self.data.data[params.token_id].author != sp.sender)))
        self.data.data[params.token_id].collectable = False
        self.data.data[params.token_id].holder = sp.sender

        #sending rewards
        sp.send(self.data.data[params.token_id].author, sp.split_tokens(sp.amount, 97, 100))
        
        self.fa2_transfer(self.data.token, sp.self_address, sp.sender, params.token_id, 1)


    @sp.entry_point
    def update_admin(self, params):
        sp.verify(sp.sender == self.data.admin)
        self.data.admin = params
        
    def fa2_transfer(self, fa2, from_, to_, token_id, amount):
        c = sp.contract(sp.TList(sp.TRecord(from_=sp.TAddress, txs=sp.TList(sp.TRecord(amount=sp.TNat, to_=sp.TAddress, token_id=sp.TNat).layout(("to_", ("token_id", "amount")))))), fa2, entry_point='transfer').open_some()
        sp.transfer(sp.list([sp.record(from_=from_, txs=sp.list([sp.record(amount=amount, to_=to_, token_id=token_id)]))]), sp.mutez(0), c)



@sp.add_test(name = "Non Fungible Token")
def test():
    scenario = sp.test_scenario()
    
    admin = sp.test_account("admin")
    mark = sp.test_account("user1")
    elon = sp.test_account("user2")
    
    scenario.h1("Henbane")
    marketplace = Henbane(sp.address("KT1NrfTu3FjBt2E73gqkLE92vaVoEzSyiwXH"), sp.utils.metadata_of_url("ipfs://QmVXRNA19GJX38p3f4dcUqWt4qeiVwsHwXVQ76LgRVWYg9"), admin.address)
    scenario += marketplace