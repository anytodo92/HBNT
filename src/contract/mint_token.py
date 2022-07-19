import smartpy as sp

FA2 = sp.io.import_template("FA2.py")

class NFT(FA2.FA2):
   pass

@sp.add_test(name="tests")
def test():
  jerry = sp.test_account("Jerry")
  tom = sp.test_account("Tom")
  admin = sp.address("tz1YrMAgVNaK1rvXPx85zvCfoET9e6JyWoKt")
  scenario = sp.test_scenario()
  scenario.h1("tutorial tests")
  nft = NFT(FA2.FA2_config(non_fungible=True), admin=admin, metadata= sp.big_map({"": sp.utils.bytes_of_string("tezos-storage:content"),"content": sp.utils.bytes_of_string("""{"name": "Henbane Token", "description": "Henbane NFT Token"}""")}))
  scenario += nft
  nft.mint(token_id=0, address=jerry.address, amount=1, metadata = sp.map({"": sp.utils.bytes_of_string("ipfs://bafkreih36m3d4yfbpyteluvntuph5xybwtgxdvyksbgyg66es44drk4hqy")})).run(sender=admin)